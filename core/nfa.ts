///#pragma once
///#include <compat.ts>
///#include <signature.ts>

namespace FiniteAutomata {
    type NFAState = Opaque<number,'NFAState'>;
    type DFAState = Opaque<number,'DFAState'>;
    export type LambdaEdge = [start: NFAState, end: NFAState];
    export type StructuralEdge = [...LambdaEdge, char];
    export type NFA = {
        start: NFAState,
        end: NFAState,
        edges: (StructuralEdge | LambdaEdge)[],
    }
    export class NFAContext {
        constructor(public readonly alphabet: ReadonlySet<char>) {}
    
        private readonly iter = (function*(i = 0) {
            while(true) yield i++ as NFAState;
        })();
    
        public createState(): NFAState {
            return this.iter.shift();
        }

        public createStates(n: number = 1): NFAState[] {
            return [...this.iter.shift(n)];
        }

        public lambdaWrap(nfa: NFA): NFA {
            const [start, end] = this.createStates(2);
            return {
                start,
                end,
                edges: [[start,nfa.start], ...nfa.edges, [nfa.end,end]]
            }
        }
    }
    export interface NFAConvertible {
        toNFA(ctx: NFAContext): NFA;
    }

    export type DFA = Map<DFAState,Map<char,DFAState> & Partial<{start: boolean, accepting: boolean}>>;

    export function toDFA(nfa: NFA, ctx: NFAContext): DFA {
        function followLambda(S: NFAState[] | Set<NFAState>): Set<NFAState> {
            S = new Set<NFAState>(S);
            const M: Stack<NFAState> = [...S];
        
            while(M.length) {
                const t = M.pop()!;
                for(const q of nfa.edges.flatMap(function([from,to,char]) {
                    return char === undefined && from === t ? [to] : [];
                })) {
                    if(!S.has(q)) {
                        S.add(q);
                        M.push(q);
                    }
                }
            }
        
            return sorted(S);
        }
        function followChar(S: NFAState[] | Set<NFAState>, c: char): Set<NFAState> {
            const F = new Set<NFAState>();
        
            for(const t of S) {
                for(const q of nfa.edges.flatMap(function([from,to,char]) {
                    return char === c && from === t ? [to] : [];
                })) {
                    F.add(q);
                }
            }
        
            return sorted(F);
        }

        function sorted(S: Set<NFAState>): typeof S {
            return new Set([...S].sort((a, b) => a - b));
        }

        type RawDFA = SignatureMap<Set<NFAState>,Map<char,Set<NFAState>> & Partial<{start: boolean, accepting: boolean}>>;
        const T: RawDFA = new SignatureMap();

        const L: Stack<Set<NFAState>> = [];
        const A: Set<NFAState> = sorted(new Set([nfa.end]));
        const i: NFAState = nfa.start;
        const B = followLambda([i]);

        T.set(B, Object.assign(new Map(), {start: true}));

        if(A.intersection(new Set(B)).size) {
            T.get(B).accepting = true;
        }
        L.push(B);

        do {
            const S = L.pop();
            for(const c of ctx.alphabet) {
                const R = followLambda(followChar(S,c));
                T.get(S).set(c,R);
                if(R.size && !(T.has(R))) {
                    T.set(R, new Map());
                    if(A.intersection(new Set(R)).size) {
                        T.get(R).accepting = true;
                    }
                    L.push(R)
                }
            }
        } while(L.length);

        const dfa = new Map();
        const n = (function() {
            const M = new SignatureMap<Set<NFAState>,DFAState>();
            let n = 0;
            
            return function(state: Set<NFAState>) {
                if(!M.has(state)) {
                    M.set(state,n++ as DFAState);
                }
                return M.get(state);
            }
        })();

        for(const [state,value] of T.entries()) {
            dfa.set(n(state), new Map(value.entries().map(([c,state]) => [c,n(state)] as [char,DFAState])));
        }

        return dfa;
    }

    export function optimizeDFA(dfa: DFA, ctx: NFAContext): DFA {
        const T = dfa;
        
        // Remove dead states
        // console.log(FiniteAutomata.optimizeDFA(new Map([
        //     [0,Object.assign(new Map([['a',1],['b',2]]),{start:true})],
        //     [1,Object.assign(new Map([['a',1]]),{accepting:true})],
        //     [2,Object.assign(new Map([['a',2]]),{})] // Dead
        // ] as any), new FiniteAutomata.NFAContext(new Set(['a','b','c']))));
        function removeDeadStates() {
            const A = new Set<DFAState>(); // Accessible states

            const M = new Map<DFAState,DFAState[]>(T.entries().map(([k,_])=>[k, T.entries().flatMap(([n,v])=>v.values().toArray().includes(k) ? [n] : []).toArray()]));
            const L: Stack<DFAState> = T.entries().filter(([k,v])=>v.accepting).map(([k])=>k).toArray();
            
            while(L.length) {
                const s = L.pop()!;
                if(!A.has(s)) {                
                    for(const p of M.get(s)??[]) {
                        L.push(p);
                    }
                    A.add(s);
                }
            }
            
            const V = new Set<DFAState>(); // Removed states
            for(const [k,v] of T.entries()) {
                if(A.has(k)) continue;

                V.add(k);
                T.delete(k);
            }
    
            // Fix ids
            for(const v of T.values()) {
                for(const [k,t] of v.entries()) {
                    if(V.has(t)) {
                        v.delete(k);
                    }
                }
            }
        }

        function mergeStates() {
            const T = dfa;

            const M = new Set<DFAState[]>();
            const L: Stack<[DFAState[],char[]]> = [];

            L.push(
                [T.entries().filter(([k,v])=>v.accepting).map(([k])=>k).toArray(),[...ctx.alphabet]]
            );
            L.push(
                [T.entries().filter(([k,v])=>!v.accepting).map(([k])=>k).toArray(),[...ctx.alphabet]]
            );

            // Identify duplicates
            do {
                const [S,C] = L.pop()!;
                const c: char = C.shift()!;

                const P = Object.values(Object.groupBy(S,s=> T.get(s).get(c)??`${undefined}`));
                for(const X of P.filter(X=>X.length>1)) {
                    if(!C.length) {
                        M.add(X);
                    } else {
                        L.push([X,[...C]]);
                    }
                }
            } while(L.length);
            
            // Merge into first
            for(const X of M) {
                const s0 = X.shift()!
                const J = T.get(s0);

                const V = new Set<DFAState>(); // Removed states
                for(const s of X) {
                    J.accepting ||= T.get(s).accepting;

                    T.delete(s);
                    V.add(s);
                }

                // Fix ids
                for(const v of T.values()) {
                    for(const [k,t] of v.entries()) {
                        if(V.has(t)) {
                            v.set(k,s0);
                        }
                    }
                }
            }
        }

        removeDeadStates();

        let size;
        do {
            size = T.size;
            mergeStates();
        } while(size != T.size);
        
        
        // Pull down ids
        const G = T.keys().reduce((G,s)=>{G[s]=s; return G;}, [] as DFAState[]).reduce((a,c)=>[...a,c], [] as DFAState[]);
        for(const [k,v] of [...T.entries()]) { // Get initial state with ... to ignore updates
            T.delete(k);
            const g = G.indexOf(k) as DFAState;
            T.set(g,v);
            for(const [k,t] of v) {
                v.set(k,G.indexOf(t) as DFAState);
            }
        }

        return dfa;
    }
}