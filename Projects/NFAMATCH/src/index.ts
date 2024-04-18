///#include "lib/compat.ts"
///#include "lib/types.ts"
///#include "lib/io.ts"

// JS data structures have all sorts of dynamic optimizations. Thus, the language only provides "arrays" which also act as both
// stacks and queues too. There is no specific linked list either. Map and Set exist but also offer no specific implementations.
// In general, trying to implment user optimized versions is much slower. The same goes for functions like sort, reduce, map, etc...

function toDFA(nfa: NFA): DFA {
    function followLambda(S: NFAStateIdentifier[] | Set<NFAStateIdentifier>): NFAStateIdentifier[] {
        S = new Set<NFAStateIdentifier>(S);
        const M: Stack<NFAStateIdentifier> = [...S];
    
        while(M.length) {
            const t = M.pop()!;
            for(const q of nfa.transitions.flatMap(transition =>
                transition.characters.includes(nfa.lambdaChar) && transition.from == t
                    ? [transition.to]
                    : []
            )) {
                if(!S.has(q)) {
                    S.add(q);
                    M.push(q);
                }
            }
        }
    
        return [...S];
    }
    
    function followChar(c: char, S: NFAStateIdentifier[] | Set<NFAStateIdentifier>): NFAStateIdentifier[] {
        const F = new Set<NFAStateIdentifier>();
    
        for(const t of S) {
            for(const q of nfa.transitions.flatMap(transition =>
                transition.characters.includes(c) && transition.from == t
                    ? [transition.to]
                    : []
            )) {
                F.add(q);
            }
        }
    
        return [...F];
    }

    const intersection = <T,>(a:T[],b:T[]) => [...new Set(a.filter(t => b.includes(t)))];
    
    // Converts a set of nfa state identifiers [i,j,k,...] into
    // a unique DFA state identifier
    const $ = (function() {
        const K = new Map<string,DFAStateIdentifier>();
        let phi = 0;
        return function $(collection: NFAStateIdentifier[]): DFAStateIdentifier {
            const key = [...collection].sort().join(',');
            if(!K.has(key))
                K.set(key,phi++);
            return K.get(key)!;
        }
    })();

    function initialize(T: DFATransitionTable, J: DFAStateIdentifier) {
        T[J] = {id: J, isStart: false, isAccepting: false, transitions: new Array(nfa.alphabet.length)}
    }

    const dfa: DFA = {alphabet: nfa.alphabet, states: []};
    const T: DFATransitionTable = dfa.states;

    const L: Stack<NFAStateIdentifier[]> = [];
    const A: NFAStateIdentifier[] = [...new Set(nfa.transitions.flatMap(transition=>transition.isAccepting?[transition.from]:[]))];
    const i = 0;
    const B: NFAStateIdentifier[] = followLambda([i]);
    initialize(T,$(B));
    T[$(B)].isStart = true;
    if(intersection(A,B).length) {
        T[$(B)].isAccepting = true;
    }
    L.push(B);
    
    do {
        const S = L.pop()!;
        for(const c of nfa.alphabet) {
            const R = followLambda(followChar(c,S));
            T[$(S)].transitions[nfa.alphabet.indexOf(c)] = R.length ? $(R) : null;
            if(R.length && !T[$(R)]) {
                initialize(T,$(R));
                if(intersection(A,R).length) {
                    T[$(R)].isAccepting = true;
                }
                L.push(R);
            }
        }
    } while(L.length);

    return dfa;
}

function optimizeDFA(dfa: DFA): DFA {
    const T = dfa.states;
    
    function removeDeadStates() {
        const A = new Set<DFAStateIdentifier>();
        const M = new Map<DFAStateIdentifier,DFAState[]>(T.map(s=>[s.id, T.filter(k=>k.transitions.includes(s.id))]));
        const L: Stack<DFAState> = T.filter(x=>x.isAccepting);
        
        while(L.length) {
            const s = L.pop()!;
            if(!A.has(s.id)) {                
                for(const p of M.get(s.id)??[]) {
                    L.push(p);
                }
                A.add(s.id);
            }
        }
        
        const V = new Set<DFAStateIdentifier>();

        for(let i = 0; i < T.length; void 0) {
            if(A.has(T[i].id)) {
                i++;
            }
            else {
                V.add(T[i].id);
                T.splice(i,1);
            }
        }

        for(const s of T) {
            s.transitions = s.transitions.map(to=>to!==null && V.has(to) ? null : to);
        }
    }

    function mergeStates() {
        const M = new Set<DFAState[]>();
        const L: Stack<[DFAState[],char[]]> = [];

        L.push([T.filter(s=>s.isAccepting),[...dfa.alphabet]]);
        L.push([T.filter(s=>!s.isAccepting),[...dfa.alphabet]]);

        do {
            const [S,C] = L.pop()!;
            const c: char = C.shift()!;

            const P = Object.values(Object.groupBy(S,s=>s.transitions[dfa.alphabet.indexOf(c)]??'E'));
            for(const X of P.filter(X=>X.length>1)) {
                if(!C.length) {
                    M.add(X);
                } else {
                    L.push([X,[...C]]);
                }
            }
        } while(L.length);

        for(const X of M) {
            const J = X.shift()!;

            const V = X.map(s => {
                J.isAccepting ||= s.isAccepting;
                T.splice(T.indexOf(s),1);
                return s.id;
            });
    
            for(const s of T) {
                s.transitions = s.transitions.map(to=>to!==null && V.includes(to) ? J.id : to);
            }
        }
    }

    removeDeadStates();

    let length;
    do {
        length = T.length;
        mergeStates();
    } while(length != T.length);

    const G = T.reduce((G,s)=>{G[s.id]=s.id; return G;},[] as DFAStateIdentifier[]).reduce((a,c)=>[...a,c], [] as DFAStateIdentifier[]);
    for(const s of T) {
        s.id = G.indexOf(s.id);
        s.transitions = s.transitions.map(to => to != null ? G.indexOf(to) : to);
    }

    return dfa;
}

function testToken(token: string, dfa: DFA) {
    function output<T>(...args: T[]) {
        console.log(`OUTPUT ${args.join(' ')}`);
    }
    let s = 0, i = 0;
    const T = dfa.states;
    while(i <= token.length) {
        if(T[s].isAccepting && i === token.length) {
            return output(':M:');
        }

        const next = T[s].transitions[dfa.alphabet.indexOf(token.charAt(i++) as char)];
        if(next === null) {
            return output(i);
        } else {
            s = next!;
        }
    }

    return output(token === '' ? 0 : i);
}

const DO_OPTIMIZE = true;
(function main() {
    try {
        const [inputNFAPath, outputDFAPath, ...testTokens] = system.args.slice(1);
        const nfa = readNFA(inputNFAPath);
        const dfa = DO_OPTIMIZE ? optimizeDFA(toDFA(nfa)) : toDFA(nfa);
        writeDFA(outputDFAPath, dfa);
        for(const token of testTokens) {
            testToken(token, dfa);
        }
    } catch(e) {
        console.error(e);
        system.exit(1);
    }
})();