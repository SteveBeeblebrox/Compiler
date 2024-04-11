///#pragma once

///#include <compat.ts>
///#include <types.ts>
///#include <tree.ts>
///#include <peek.ts>

///#include "cfg.ts"

namespace LL1 {
    export type LL1ParseTable = Map<NonTerminal,Map<Terminal,number>>;
    
    type SyntaxTransformer<ASTNodeType extends Tree> = (node: ParseTreeNode)=>typeof node | ASTNodeType | ASTNodeType[] | null

    export type SyntaxTransformerMap<ASTNodeType extends Tree> = Map<NonTerminal | '*', SyntaxTransformer<ASTNodeType>>;

    function convertLeftRecursion(cfg: CFG): CFG {
        const newRules = new Map<NonTerminal,CFGRuleBody[]>()
    
        function getTailOverrlap<T>(a: T[], b: T[]) {
            let overlap: T[] = [];
            let i = -1;
            while(a.at(i) === b.at(i) && a.at(i) !== undefined) {
                overlap.unshift(a.at(i--)!);
            }
            return overlap;
        }
    
        function arrayEquals<T>(a: T[], b: T[]) {
            return a.length === b.length && a.every((e, i) => e === b[i]);
        }
    
        for(const N of cfg.getNonTerminals()) {
            // Sort by descending length to ensure we see non lambda rules first
            const rules = new Set(cfg.getRuleListFor(N).sort(([lhsA,rhsA],[lhsB,rhsB])=>rhsB.length-rhsA.length));
            newRules.set(N,[]);
    
            refactor:
            for(const [lhs1,rhs1,ref1] of rules.values().map(r=>[...r,r] as [NonTerminal,CFGRuleBody,CFGRule])) {
                if(rhs1[0] === lhs1) {
                    for(const [lhs2,rhs2,ref2] of rules.values().map(x=>[...x,x] as [NonTerminal,CFGRuleBody,CFGRule])) {
                        if(rhs1 === rhs2) {
                            continue;
                        }
    
                        const beta = getTailOverrlap(rhs1,rhs2);
                        
                       if(arrayEquals(rhs2,beta)) {
                            const A = lhs1;
                            const gamma = rhs1.slice(1,rhs1.length-beta.length);
                            rules.delete(ref1);
                            rules.delete(ref2); // Don't visit again
    
                            const R = CFG.makeUniqueNonTerminal(cfg,N);
    
                            newRules.get(N)!.push([...beta,R]);
                            newRules.set(R, [[...gamma, ...beta, R],[]]);
                            continue refactor;
                       }
                    }
                }
    
                newRules.get(N)!.push(rhs1); // No refactor happened
            }
        }
    
        return new CFG(cfg.startingSymbol, newRules, new Set(cfg.getTerminals()));
    }

    function leftFactor(cfg: CFG): CFG {
        const newRules = new Map<NonTerminal,CFGRuleBody[]>()
    
        for(const N of cfg.getNonTerminals()) {
            const rules = new Set(cfg.getRuleListFor(N));
            newRules.set(N,[]);
    
            for(const [lhs1,rhs1,ref1] of rules.values().map(r=>[...r,r] as [NonTerminal,CFGRuleBody,CFGRule])) {
                if(rhs1.length < 1) {
                    newRules.get(N)!.push(rhs1);
                    continue;
                }
                
                const pre1 = rhs1[0];
                const W = CFG.makeUniqueNonTerminal(cfg,N);
                let anyOverlaps = false;
    
                for(const [lhs2,rhs2,ref2] of rules.values().map(r=>[...r,r] as [NonTerminal,CFGRuleBody,CFGRule])) { 
                    const pre2 = rhs2[0];
                    if(rhs1 !== rhs2 && pre1 === pre2) {
                        if(!anyOverlaps) {
                            newRules.set(W,[]);
                        }
                        anyOverlaps = true;
    
                        newRules.get(W)!.push(rhs2.slice(1));
                        rules.delete(ref2);
                    }
                }
    
                if(anyOverlaps) {
                    newRules.get(W)!.push(rhs1.slice(1));
                    newRules.get(N)!.push([pre1,W]);
                    rules.delete(ref1);
                } else {
                    newRules.get(N)!.push(rhs1);
                }
            }
        }
    
        return new CFG(cfg.startingSymbol, newRules, new Set(cfg.getTerminals()));
    }

    // Note, some of the optimizations can't see through  A -> B -> C rules
    // Ideally, we'd optimize those out first, but that's nyi (or maybe compare with first sets?)
    function transform(cfg: CFG): CFG {
        let k;
        do {
            k = cfg.getRuleList().length;
            cfg = leftFactor(cfg);
        } while(k != cfg.getRuleList().length);

        return convertLeftRecursion(cfg);
    }

    function createParseTable(cfg: CFG): LL1ParseTable {
        const parseTable: LL1ParseTable = new Map(cfg.getNonTerminals().map(N=>[N,new Map(cfg.getTerminalsAndEOF().map(a => [a,-1]))]));
        let i = 0;
        for(const lhs of cfg.getNonTerminals()) {
            const rules = cfg.getRuleListFor(lhs).map(([_,rhs])=>rhs);
            const row = parseTable.get(lhs)!;
            for(const rhs of rules) {
                const P = cfg.predictSet([lhs,rhs]);
                for(const a of P) {
                    if(row.get(a) != -1) {
                        // Possibly implement C hack for dangling bracket here later on or just mark issue
                        throw new Error(`Grammar is not LL(1) (Caused by rules ${row.get(a)} and ${i})`);
                    } else {
                        row.set(a,i);
                    }
                }
                i++;
            }
        }
        return parseTable;
    }

    export class LL1Parser<ASTNodeType extends Tree=never> {
        private readonly parseTable: LL1ParseTable;
        private readonly cfg: CFG;
        private readonly sdt: SyntaxTransformerMap<ASTNodeType>; 
        constructor(cfg: CFG, sdt: {[key in NonTerminal | '*']?: SyntaxTransformer<ASTNodeType>} | SyntaxTransformerMap<ASTNodeType> = new Map()) {
            this.cfg = transform(cfg);
            this.parseTable = createParseTable(this.cfg);
            this.sdt = sdt instanceof Map ? sdt : new Map(Object.entries(sdt)) as SyntaxTransformerMap<ASTNodeType>;
        }
        public getCFG() {
            return this.cfg;
        }
        public getParseTable() {
            return this.parseTable;
        }
        public parse(tokens: Iterable<Token>): LL1Parser.ParseResult<ASTNodeType> {
            const LLT = this.parseTable;
            const P = this.cfg.getRuleList();
            const ts = createPeekableIterator(tokens);
            const MARKER = Symbol();
        
            const T: ParseTree = new ParseTreeNode();
            type StackT = NonTerminal | Terminal | typeof MARKER | typeof CFG.LAMBDA_CHARACTER;
            const K: Stack<StackT> = [];
        
            let Current: ParseTree = T;
            K.push(this.cfg.startingSymbol);
        
            while(K.length) {
                let x: StackT | Token = K.pop()!;
                if(x === MARKER) {
                    // Hold a reference to the current parrent
                    const parent = Current.parent;

                    // Disjoin completed node
                    const node = parent.pop() as ParseTreeNode;
                    let rvalue: any = node;
                    
                    // Apply wildcard transforms
                    if(this.sdt.has('*')) {
                        rvalue = this.sdt.get('*')(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }

                    // Apply NonTerminal specific transforms
                    if(rvalue === node && this.sdt.has(node.name as NonTerminal)) {
                        rvalue = this.sdt.get(node.name as NonTerminal)(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }
                    
                    // Restore connections
                    if(Array.isArray(rvalue)) {
                        parent.push(...rvalue);
                    } else if(rvalue != null) {
                        parent.push(rvalue);
                    }

                    // Continue parsing
                    Current = parent;
                } else if(CFG.isNonTerminal(x)) {
                    let p = P[LLT.get(x)?.get(ts.peek()?.name as Terminal) ?? throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name ?? 'EOF'}`))] ?? throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name ?? 'EOF'}`));
                    K.push(MARKER);
                    const R = p[1];
                    
                    if(this.cfg.isStartingRule(p)) {
                        K.push(CFG.EOF);
                    }
        
                    if(R.length) {
                        K.push(...[...R].reverse());
                    } else {
                        K.push(CFG.LAMBDA_CHARACTER);
                    }
        
                    const n: ParseTree = new ParseTreeNode(x);
                    Current.push(n);
                    Current = Current.at(-1)! as ParseTree;
                } else if(CFG.isTerminalOrEOF(x)) {
                    if(x !== ts.peek()?.name as Terminal) {
                        throw new Error(`Syntax Error: Unexpected token ${ts.peek()?.name ?? 'EOF'} expected ${x}`);
                    }
                    x = ts.shift()!;
                    Current.push(x instanceof Token ? new ParseTreeTokenLeaf(x.name as Terminal, x.value) : new ParseTreeEOFLeaf());
                } else if(CFG.isLambda(x)) {
                    Current.push(new ParseTreeLambdaLeaf());
                }
            }
        
            if(T.length !== 1) {
                throw new Error(`Syntax Error`);
            }
        
            return T.pop()! as ParseResult<ASTNodeType>;
        }
    }

    export namespace LL1Parser {
        abstract class AbstractParseTree<NameType extends string = string> extends Tree {
            constructor(public readonly name?: NameType) {super();}
        }

        export class ParseTreeNode extends AbstractParseTree<NonTerminal> implements ArrayTreeMethods {
            constructor(name?: NonTerminal) {super(name);}
            public override get parent() {
                return super.parent as ParseTree;
            }

            public get length() {
                return super[Tree.treeLength];
            }

            public at = super[Tree.at];
            public values = super[Tree.values];
            public push = super[Tree.push];
            public unshift = super[Tree.unshift];
            public pop = super[Tree.pop];
            public shift = super[Tree.shift];
            public splice = super[Tree.splice];
            public [Symbol.iterator] = super[Tree.iterator];
        
            @enumerable
            public get children() {
                return [...this];
            }
        }

        export class ParseTreeLambdaLeaf extends AbstractParseTree<typeof CFG.LAMBDA_CHARACTER> {
            constructor() {super(CFG.LAMBDA_CHARACTER);}
        }

        export class ParseTreeEOFLeaf extends AbstractParseTree<typeof CFG.EOF_CHARACTER> {
            constructor() {super(CFG.EOF_CHARACTER);}
        }

        export class ParseTreeTokenLeaf extends AbstractParseTree<Terminal> {
            constructor(name: Terminal, public value?: string) {super(name);}
        }

        export type ParseTreeLeaf = ParseTreeLambdaLeaf | ParseTreeEOFLeaf | ParseTreeTokenLeaf;
        export type ParseTree = NestedTree<ParseTreeNode, ParseTreeNode | ParseTreeLeaf, false> & {parent?: ParseTree};
        export type ParseResult<ASTNodeType extends Tree = never> = ASTNodeType | StrayTree<ParseTree>;
    }

    import ParseTree = LL1Parser.ParseTree;
    import ParseTreeNode = LL1Parser.ParseTreeNode;
    import ParseTreeLambdaLeaf = LL1Parser.ParseTreeLambdaLeaf;
    import ParseTreeEOFLeaf = LL1Parser.ParseTreeEOFLeaf;
    import ParseTreeTokenLeaf = LL1Parser.ParseTreeTokenLeaf;
    export import ParseResult = LL1Parser.ParseResult;
}

import LL1Parser = LL1.LL1Parser;