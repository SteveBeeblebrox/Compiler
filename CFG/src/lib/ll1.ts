namespace LL1 {
    export function convertLeftRecursion(cfg: CFG): CFG {
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
            const rules = new Set(cfg.getRuleListFor(N));
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

    export function parse(cfg: CFG, tokens: Iterator<Token>): ParseTree {
        const LLT = cfg.toParseTable();
        const P = cfg.getRuleList();
        const ts = createPeekableIterator(tokens);
        const MARKER = Symbol();
    
        type TreeT = NonTerminal | Token | typeof CFG.EOF | typeof CFG.LAMBDA;
        const T: StrayTree<TreeT> = new Tree<TreeT>(undefined as unknown as Token) as StrayTree<TreeT>;
        type StackT = NonTerminal | Terminal | typeof MARKER | typeof CFG.LAMBDA
        const K: Stack<StackT> = [];
    
        let Current: Tree<TreeT> = T;
        K.push(cfg.startingSymbol);
    
        while(K.length) {
            let x: StackT | Token = K.pop()!;
            if(x === MARKER) {
                Current = Current.parent!;
            } else if(CFG.isNonTerminal(x)) {
                let p = P[LLT.get(x)?.get(ts.peek()?.name!) ?? throws(new Error(`Syntax Error: Unexpected token ${(ts.peek()??{name:CFG.EOF}).name}`))];
                K.push(MARKER);
                const R = p[1];
                
                if(cfg.isStartingRule(p)) {
                    K.push(CFG.EOF);
                }
    
                if(R.length) {
                    K.push(...[...R].reverse());
                } else {
                    K.push(CFG.LAMBDA);
                }
    
                const n = new Tree<TreeT>(x);
                Current.push(n);
                Current = Current.at(-1)!;
            } else if(CFG.isTerminalOrEOF(x) || CFG.isLambda(x)) {
                if(CFG.isTerminalOrEOF(x)) {
                    if(x !== (ts.peek()??{name:CFG.EOF}).name) {
                        throw new Error(`Syntax Error: Unexpected token ${(ts.peek()??{name:CFG.EOF}).name}`);
                    }
                    x = ts.pop() ?? CFG.EOF;
                }
                Current.push(new Tree(x));
            }
        }
    
        if(T.length !== 1) {
            throw new Error(`Syntax Error`);
        }
    
        return T.pop()!;
    }
}