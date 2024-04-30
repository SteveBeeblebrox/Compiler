///#pragma once
///#include <compat.ts>
///#include <signature.ts>

namespace FiniteAutomata {
    type NFAState = Opaque<number,'NFAState'>
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

    export function toDFA(nfa: NFA) {
        function followLambda(S: NFAState[] | Set<NFAState>): NFAState[] {
            S = new Set<NFAState>(S);
            const M: Stack<NFAState> = [...S];
        
            while(M.length) {
                const t = M.pop()!;
                for(const q of nfa.edges.flatMap(function([from,to,char]) {
                    return char === undefined && from === t ? [to] : []
                })) {
                    if(!S.has(q)) {
                        S.add(q);
                        M.push(q);
                    }
                }
            }
        
            return [...S];
        }
        function followChar(c: char, S: NFAState[] | Set<NFAState>): NFAState[] {
            const F = new Set<NFAState>();
        
            for(const t of S) {
                for(const q of nfa.edges.flatMap(function([from,to,char]) {
                    return char === c && from === t ? [to] : []
                })) {
                    F.add(q);
                }
            }
        
            return [...F];
        }
    }
}