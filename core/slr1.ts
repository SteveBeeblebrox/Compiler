#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <types.ts>
///#include <tree.ts>
///#include <peek.ts>
///#include <signature.ts>
///#include <csv.ts>
///#include <range.ts>

///#include "parsing.ts"
///#include "graphviz.ts"
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
                        throw new Error(`Grammar is not SLR(1) (Caused by item set ${i})`);
                    }
                    
                    T.get(i).set(f, `r-${cfg.getRuleNumber([P[0],P.slice(1).filter(x=>x!==MARKER) as CFG.CFGRuleBody])}`);
                }
            }

            let P;
            if(P = I[Symbol.iterator]().find(([lhs,...rhs]) => rhs.at(-1) === MARKER && rhs.at(-2) === CFG.EOF && cfg.isStartingRule(lhs))) {
                T.set(i, new Map(cfg.getGrammarSymbols().map(x=>[x,`R-${cfg.getRuleNumber([P[0],P.slice(1).filter(x=>x!==MARKER) as CFG.CFGRuleBody])}`])));
            }
        }

        return T;
    }

    export class SLR1Parser<ASTNodeType extends Tree=never> {
        private readonly parseTable: SLR1Parser.SLR1ParseTable;
        constructor(private readonly cfg: CFG, private readonly sdt: Parsing.SyntaxTransformer<ASTNodeType> = new Parsing.SyntaxTransformer({}), private readonly tt: Parsing.TokenTransformer<ASTNodeType> = new Parsing.TokenTransformer({}), cache?: string) {
            // Try to load from cache
            try {
                if(cache !== undefined) {
                    const {signature, table} = JSON.parse(LZCompression.decompressFromUint8Array(system.readFileSync(cache)));
                    if(Signature.create(cfg as any) === signature) {
                        this.parseTable = this.deserializeTableFromCSV(table);
                    }
                }
            } catch(e) {}

            
            if(this.parseTable === undefined) {
                this.parseTable = createParseTable(cfg);
                // Save to cache
                try {
                    if(cache !== undefined) {
                        system.writeFileSync(cache,LZCompression.compressToUint8Array(JSON.stringify({signature: Signature.create(cfg as any), table: this.toCSV()})));
                    }
                } catch(e) {}
            }
        }
        private deserializeTableFromCSV(csv: string): SLR1Parser.SLR1ParseTable {
            const T = new Map();
            const [[_,...header],...rows] = csv.trim().split('\n').map(x=>x.split(','));
            for(const row of rows) {
                const R = new Map();
                T.set(+row.shift(), R);
                for(const i of range(row.length)) {
                    if(row[i]) {
                        R.set(header[i] === CFG.EOF_CHARACTER ? CFG.EOF : header[i],row[i]);
                    }
                }
            }
            return T;
        }
        public toCSV(): string {
            const T = this.getParseTable();
            const data: string[] = [['.',...this.cfg.getGrammarSymbols().map(s=>s??CFG.EOF_CHARACTER)].join(',')];
            for(const [i,R] of T.entries()) {
                const row = new Map(this.cfg.getGrammarSymbols().map(s=>[s,undefined]));
                for(const [k,v] of R.entries()) {
                    row.set(k,v);
                }
    
                data.push([i,...row.values().map(x=>x??'')].join(','));
            }
            return data.join('\n');
        }
        public getCFG() {
            return this.cfg;
        }
        public getParseTable() {
            return this.parseTable;
        }
        public parse(tokens: Iterable<Token>): ParseResult<ASTNodeType> {
            const T = this.parseTable;
            const cfg = this.cfg;
            const sdt = this.sdt;
            const tt = this.tt;
            const ts = createPeekableIterator(tokens);
            const D: Queue<Token | ParseTree | undefined> = [];
            
            type StackT = {state: number, tree?: ParseTree | Token | undefined};
            const S: Stack<StackT> = [];
            S.push({state:0});
            
            const ruleList = cfg.getRuleList();
            function reduce(n: number): StrayTree<InnerParseTree> {                
                const [lhs,rhs] = ruleList[n];
                const node = new ParseTreeNode(lhs);

                if(rhs.length === 0) {
                    node.push(new ParseTreeLambdaNode());
                } else {
                    for(const expected of [...rhs, ...(cfg.isStartingRule(lhs) ? [undefined] : [])].reverse()) {
                        const {state,tree:t} = S.pop();
                        if(CFG.isEOF(expected) && t === undefined) {
                            node.unshift(new ParseTreeEOFNode());
                        } else if(CFG.isTerminal(expected) && t instanceof Token) {
                            node.unshift(tt.transform(new ParseTreeTokenNode(t.name as Terminal, t.value, t.pos)));
                        } else if (CFG.isNonTerminal(expected) && t instanceof Tree) {
                            ///#warning test slr1 sdt
                            const child = sdt.transform(t as StrayTree<ParseTreeNode>);                    

                            if(Array.isArray(child)) {
                                node.unshift(...child);
                            } else if(child != null) {
                                node.unshift(child as InnerParseTree);
                            }

                            // node.unshift(t);
                        } else {
                            throw new Parsing.SyntaxError(`Expected '${expected??'EOF'}' got '${t?.name??t??'EOF'}'`)
                        }
                    }
                }

                return node as StrayTree<InnerParseTree>;
            }

            while(D.length || ts.peek() || T.get(S.at(-1).state).has(undefined)) {
                let t = D.at(0) ?? ts.peek();
                const [action,v] = T.get(S.at(-1).state).get(t?.name as CFG.GrammarSymbol)?.split('-') ?? [];
                if(action === undefined) {
                    throw new Parsing.SyntaxError(`Expected one of ${T.get(S.at(-1).state).keys().map(x=>`'${x??'EOF'}'`).toArray().join(', ')} got '${t?.name??t??'EOF'}'`);
                }
                
                const n = +v;
                if(action === 'sh') {
                    const t = D.shift() ?? ts.shift();
                    S.push({state:n,tree:t});
                } else if(action === 'r') {
                    D.unshift(reduce(n));
                } else if(action === 'R') {
                    return this.sdt.transform(reduce(n) as StrayTree<ParseTreeNode>) as ParseResult<ASTNodeType>;
                }
            }
            throw new Parsing.SyntaxError(`Unexpected token 'EOF'`);
        }
    }

    export namespace SLR1Parser {
        type SLR1ParseTableEntry = `sh-${number}` | `${'R'|'r'}-${number}`
        export type SLR1ParseTable = Map<number,Map<CFG.GrammarSymbol,SLR1ParseTableEntry>>;    
    }

    import InnerParseTree = Parsing.InnerParseTree;
    import ParseTree = Parsing.ParseTree;
    import ParseTreeNode = Parsing.ParseTreeNode;
    import ParseTreeLambdaNode = Parsing.ParseTreeLambdaNode;
    import ParseTreeEOFNode = Parsing.ParseTreeEOFNode;
    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    import ParseResult = Parsing.ParseResult;
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
///#endif