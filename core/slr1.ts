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
    export type SLR1ParseTable = any;//Map<NonTerminal,Map<Terminal,number>>;

    export class CFSM {
        private readonly itemSets: SignatureSet<CFSM.ItemSet>;
        private readonly edges: SignatureSet<[CFSM.ItemSet, NonTerminal|Terminal|typeof CFG.EOF, CFSM.ItemSet]>;
        constructor(private readonly G: CFG) {
            this.itemSets = new SignatureSet([this.closure(this.freshStarts(this.G.startingSymbol))]);
            this.edges = new SignatureSet();

            for(const I of this.itemSets) {
                let n = -1;
                while(n != this.itemSets.size) {
                    n = this.itemSets.size;
                    for(const X of this.G.getGrammarSymbols()) {
                        const R = this.goto(I,X);
                        if(R.size !== 0) {
                            this.itemSets.add(R);
                            this.edges.add([I,X,R]);
                        }
                    }
                }
            }
        }

        freshStarts(B: NonTerminal): CFSM.ItemSet {
            return new SignatureSet(this.G.getRuleListFor(B).map(([lhs,rhs]) => [lhs,MARKER,...rhs,...(B === this.G.startingSymbol ? [undefined] : [])]));
        }

        closure(I: CFSM.ItemSet): CFSM.ItemSet {
            const C = new SignatureSet(I);
            let size = -1;
            let k = 0;
            while(C.size != size) {
                size = C.size;

                for(const [lhs,...rhs] of [...C]) {
                    const B = rhs[rhs.indexOf(MARKER) + 1];
                    if(CFG.isNonTerminal(B)) {
                        C.takeUnion(this.freshStarts(B));
                    }
                }
            }
            return C;
        }
        goto(I: CFSM.ItemSet, X: NonTerminal|Terminal|typeof CFG.EOF) {
            const K = new SignatureSet(I[Symbol.iterator]()
                .filter(([lhs,...rhs]) => rhs[rhs.indexOf(MARKER)+1] === X)
                .map(function(k: CFSM.Item): CFSM.Item {
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

            return this.closure(K);
        }

        public getItemSets() {
            return this.itemSets;
        }

        public getEdges() {
            return this.edges;
        }

        public [Symbol.iterator]() {
            return this.itemSets[Symbol.iterator]();
        }
    }

    export namespace CFSM {
        export type ItemSet = SignatureSet<Item>;
        export type Item = [CFG.CFGRule[0], ...(CFG.CFGRuleBody[number] | typeof MARKER)[]];
    }
    

    export function createParseTable(cfg: CFG): SLR1ParseTable {
        const S = new CFSM(cfg);

        for(const I of S) {
            for(const X of cfg.getGrammarSymbols()) {
                if(false) {

                }
            }
            for(const P of []) {
                for(const f of cfg.followSet('A' as any)) {
                    if(false) {

                    }
                }
            }
            if(false) {

            }
        }

        
    }
}

///#if __MAIN__



const cfg = CFG.fromString(`

S -> A B $
S -> B C $

A -> A x
A -> x

B -> y A B
B -> h

C -> x C y
C -> p

`);

const cfsm = new SLR1.CFSM(cfg);

for(const state of cfsm) {
    for(const item of state.values()) {
        const [lhs,...rhs]=item;
        console.log(`${lhs} -> ${rhs.map(x => typeof x === 'symbol' ? '\u2022' : x??'$').join(' ')}`)
    }
    console.log('================================')
}

console.log(cfsm.getItemSets().size)

console.log(SLR1.createParseTable(cfg))

///#endif