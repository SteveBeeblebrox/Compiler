#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <types.ts>
///#include <tree.ts>
///#include <peek.ts>
///#include <signature.ts>

///#include "cfg.ts"

namespace SLR1 {
    const MARKER = Symbol('SLR1.marker');
    export type SLR1ParseTable = Map<NonTerminal,Map<Terminal,number>>;
    type Item = [CFG.CFGRule[0], ...(CFG.CFGRuleBody[number] | typeof MARKER)[]];
    type ItemSet = SignatureSet<Item>;
    type CFSM = SignatureSet<ItemSet>;

    export function itemSets(this: CFG) {
        const G = this;
        function freshStarts(B: NonTerminal): ItemSet {
            return new SignatureSet(G.getRuleListFor(B).map(([lhs,rhs]) => [lhs,MARKER,...rhs]));
        }
        function closure(I: ItemSet): ItemSet {
            const C = new SignatureSet(I);
            let size = -1;
            let k = 0;
            while(C.size != size) {
                size = C.size;

                for(const [lhs,...rhs] of [...C]) {
                    const B = rhs[rhs.indexOf(MARKER) + 1];
                    if(CFG.isNonTerminal(B)) {
                        C.takeUnion(freshStarts(B));
                    }
                }
            }
            return C;
        }
        function goto(I: ItemSet, X: NonTerminal|Terminal|typeof CFG.EOF) {
            const K = new SignatureSet(I[Symbol.iterator]()
                .filter(([lhs,...rhs]) => rhs[rhs.indexOf(MARKER)+1] === X)
                .map(function(k: Item): Item {
                    const i = k.indexOf(MARKER);
                    if(i > 0 && i < k.length - 1) {
                        return [
                            k[0],
                            ...k.slice(1,i),
                            k[i+1],
                            k[i],
                            ...k.slice(i+2)
                        ];
                    }
                    return [...k];
                })
            );

            return closure(K);
        }

        console.log(closure(freshStarts(this.startingSymbol)))

        const CFSM = new SignatureSet([])

        return CFSM;
    }
    

    // export function createParseTable(cfg: CFG): void | SLR1ParseTable {

    //     const MARKER = Symbol();



    //     console.log(TableGeneration.closure(TableGeneration.freshStarts(cfg.startingSymbol,cfg),cfg))
    // }
}

///#if __MAIN__



// console.log(CFG.fromString(`

// S -> A B $
// S -> B C $

// A -> A x
// A -> x

// B -> y A B
// B -> h

// C -> x C y
// C -> p

// `).itemSets())

console.log(new SignatureSet([new SignatureSet([1,2,3,Symbol()])]))

///#endif