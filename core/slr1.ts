#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <types.ts>
///#include <tree.ts>
///#include <peek.ts>
///#include <signature.ts>
///#include <csv.ts>

///#include "cfg.ts"

namespace SLR1 {
    const MARKER = Symbol('SLR1.marker');

    export class CFSM {
        private readonly itemSets: SignatureSet<CFSM.ItemSet>;
        private readonly edges: SignatureSet<[CFSM.ItemSet, CFG.GrammarSymbol, CFSM.ItemSet]>;
        private readonly numbers: SignatureMap<CFSM.ItemSet,number>;
        constructor(private readonly G: CFG) {
            this.itemSets = new SignatureSet([this.closure(this.freshStarts(this.G.startingSymbol))]);
            this.edges = new SignatureSet();
            this.numbers = new SignatureMap();

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

            const iter = (function*() {
                let start = 0;
                while(true) yield start++;
            })();

            for(const I of this.itemSets) {
                this.numbers.set(I, iter.shift());
            }
        }

        public getSetNumber(I: CFSM.ItemSet) {
            return this.numbers.get(I) ?? -1;
        }

        freshStarts(B: NonTerminal): CFSM.ItemSet {
            return new SignatureSet(this.G.getRuleListFor(B).map(([lhs,rhs]) => [lhs,MARKER,...rhs,...(B === this.G.startingSymbol ? [CFG.EOF] : [])]));
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
        goto(I: CFSM.ItemSet, X: CFG.GrammarSymbol) {
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
    
    export function createParseTable(cfg: CFG): SLR1Parser.SLR1ParseTable {
        const cfsm = new CFSM(cfg);

        const T: SLR1Parser.SLR1ParseTable = new Map();

        for(const I of cfsm) {
            const i = cfsm.getSetNumber(I);
            T.set(i, new Map());

            for(const X of cfg.getGrammarSymbols()) {
                if(I[Symbol.iterator]().some(([lhs,...rhs]) => [...rhs,false/*bounds check*/][rhs.indexOf(MARKER)+1] === X)) {
                    T.get(i).set(X, `sh-${cfsm.getSetNumber(cfsm.goto(I,X))}`);
                }
            }
            for(const P of I[Symbol.iterator]().filter(([lhs,...rhs]) => rhs.at(-1) === MARKER)) {
                const [A] = P;
                for(const f of cfg.followSet(A)) {
                    if(T.get(i).get(f) !== undefined) {
                        throw new Error(`Grammar is not SLL(1) (Caused by item set ${i})`);
                    }

                    const p = cfg.getRuleList().findIndex(([lhs, rhs]) => P.filter(x=>x!==MARKER).every((p,i)=>[lhs,...rhs][i] === p))
                    T.get(i).set(f, `r-${cfg.getRuleNumber([P[0],P.slice(1).filter(x=>x!==MARKER) as CFG.CFGRuleBody])}`);
                }
            }
            let P;
            if(P = I[Symbol.iterator]().find(([lhs,...rhs]) => rhs.at(-1) === MARKER && rhs.at(-2) === CFG.EOF)) {
                T.set(i, new Map(cfg.getGrammarSymbols().map(x=>[x,`R-${cfg.getRuleNumber([P[0],P.slice(1).filter(x=>x!==MARKER) as CFG.CFGRuleBody])}`])));
            }
        }

        return T;
    }

    export class SLR1Parser<ASTNodeType extends Tree=never> {
        private readonly parseTable: SLR1Parser.SLR1ParseTable;
        private readonly cfg: CFG;
        constructor(cfg: CFG) {
            this.cfg = cfg;
            this.parseTable = createParseTable(cfg);
        }
        public getCFG() {
            return this.cfg;
        }
        public getParseTable() {
            return this.parseTable;
        }
        public parse(tokens: Iterable<Token>): any {
            
        }
    }
    export namespace SLR1Parser {
        type SLR1ParseTableEntry = `sh-${number}` | `${'R'|'r'}-${number}`
        export type SLR1ParseTable = Map<number,Map<CFG.GrammarSymbol,SLR1ParseTableEntry>>;    
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
        console.log(`${lhs} -> ${rhs.map(x => typeof x === 'symbol' ? '\u2022' : x??CFG.EOF_CHARACTER).join(' ')}`)
    }
    console.log('================================')
}

console.log(cfsm.getItemSets().size)

const table = SLR1.createParseTable(cfg);

const template = Object.fromEntries(cfg.getGrammarSymbols().map(x=>[x??CFG.EOF_CHARACTER,'']));
console.log(CSV.stringify(table.values().map(function(row,i) {
    return Object.assign(Object.create(null),{'.':i},template,Object.fromEntries(row.entries().map(([k,v])=>[k??CFG.EOF_CHARACTER,v])));
}).toArray()));

///#endif