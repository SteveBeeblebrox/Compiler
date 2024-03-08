///#pragma once
declare namespace OpaqueTypes {
    const type: unique symbol;
    export type Opaque<T,Ident> = T & {[type]:Ident};
}
type Opaque<T,Ident> = OpaqueTypes.Opaque<T,Ident>;

class CFG {
    public static readonly EOF = '$' as Terminal & '$';
    public static readonly LAMBDA = '\u03bb';
    constructor(
        public readonly startingSymbol: NonTerminal,
        private readonly rules: Map<NonTerminal,CFGRuleBody[]>,
        private readonly terminals: Set<Terminal>
    ) {}

    public getTerminals(): Terminal[] {
        return [...this.terminals];
    }

    public getTerminalsAndEOF(): Terminal[] {
        return [...this.terminals, CFG.EOF];
    }

    public getNonTerminals(): NonTerminal[] {
        return [...new Set(this.rules.keys())];
    }

    public isStartingRule(rule: NonTerminal | CFGRule) {
        if(typeof rule !== 'string') return this.isStartingRule(rule[0]);
        return rule === this.startingSymbol;
    }

    public static isTerminal(string: string): string is Terminal {
        return string.toLowerCase() === string && string.length >= 1 && !this.isEOF(string) && !this.isLambda(string);
    }
    
    public static isTerminalOrEOF(string: string): string is Terminal | typeof CFG.EOF {
        return CFG.isEOF(string) || CFG.isTerminal(string);
    }

    public static isEOF(string: string): string is typeof CFG.EOF {
        return string === CFG.EOF;
    }

    public static isLambda(string: string): string is typeof CFG.LAMBDA {
        return string === CFG.LAMBDA;
    }

    public static isNonTerminal(string: string): string is NonTerminal {
        return string.toLowerCase() !== string && string.length >= 1 && !this.isEOF(string) && !this.isLambda(string);
    }

    public derivesToLambda(L: NonTerminal | Terminal, T: Stack<CFGRuleBody> = []): boolean {
        const P = this.rules;
        for(const p of (P.get(L as NonTerminal) ?? [])) {
            if([...T].includes(p)) {
                continue;
            }
            if(!p.length) {
                return true;
            }
            if(p.some(x=>CFG.isTerminal(x))) {
                continue;
            }
            let adl = true;
            for(const X of p.filter(x=>CFG.isNonTerminal(x)) as NonTerminal[]) {
                T.push(p);
                adl = this.derivesToLambda(X,T);
                T.pop();
                if(!adl) {
                    break;
                }
            }
            if(adl) {
                return true;
            }
        }
        return false;
    }
    
    public firstSet([X,...B]:(Terminal|NonTerminal)[], T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
        const P = this.rules;
    
        if(X === undefined) {
            return [new Set(),T];
        }
        if(CFG.isTerminalOrEOF(X)) {
            return [new Set([X]), T];
        }
    
        const F = new Set<Terminal>();
        if(!T.has(X)) {
            T.add(X);
            for(const p of (P.get(X) ?? [] as CFGRuleBody[][]).map(x=>[X,x])) {
                const [lhs,rhs] = p;
                const [G,I] = this.firstSet(this.startingSymbol === X ? [...rhs, CFG.EOF] : rhs,T);
                F.takeUnion(G);
            }
        }
    
        if(this.derivesToLambda(X) && B.length) {
            const [G,I] = this.firstSet(B,T);
            F.takeUnion(G);
        }
    
        return [F,T];
    }
    
    public followSet(A: NonTerminal, T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
        const P = this.rules;
    
        if(T.has(A)) {
            return [new Set(), T];
        }
    
        T.add(A);
        
        const F = new Set<Terminal>();
        
        for(const p of [...P.entries()].flatMap(([sym,rs])=>rs.flatMap(rule=>rule.includes(A) ? [[sym,rule] as [NonTerminal, CFGRuleBody]] : []))) {
            const [lhs,rhs] = p;
            for(const [i,gamma] of [...rhs.entries()].filter(([_,x])=>x===A)) {
                const pi = rhs.slice(i+1);
    
                if(pi.length) {
                    const [G,I] = this.firstSet(pi, new Set());
                    F.takeUnion(G);
                }
    
                if(!pi.length || (
                    pi.every(x=>CFG.isNonTerminal(x) && this.derivesToLambda(x))
                )) {
                    if(this.isStartingRule(lhs)) {
                        F.add(CFG.EOF);
                    }
                    const [G,I] = this.followSet(lhs,T);
                    F.takeUnion(G);
                }
            }
        }
    
        return [F,T];
    }
    
    public predictSet([lhs,rhs]: CFGRule): Set<Terminal> {
        const F = this.firstSet(rhs)[0];
        if(rhs.every(x=>this.derivesToLambda(x))) {
            [...this.followSet(lhs)[0].values()].forEach(x=>F.add(x));
        }
        return F;
    }

    public getRuleList(): CFGRule[] {
        return this.rules.entries().flatMap(([lhs,rules])=>rules.flatMap(rhs => [[lhs,rhs]])).toArray() as CFGRule[];
    }

    public getRuleListFor(rhs: NonTerminal): CFGRule[] {
        return this.rules.get(rhs)!.map(lhs => [rhs,lhs]);
    }

    public toParseTable(): ParseTable {
        const parseTable: ParseTable = new Map(this.getNonTerminals().map(N=>[N,new Map(this.getTerminalsAndEOF().map(a => [a,-1]))]));
        let i = 0;
        for(const [lhs,rules] of this.rules.entries()) {
            const row = parseTable.get(lhs)!;
            for(const rhs of rules) {
                const P = this.predictSet([lhs,rhs]);
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

    public static makeUniqueNonTerminal(cfg: CFG, name: NonTerminal, suffix='\''): NonTerminal {
        // @ts-expect-error
        while(cfg.getNonTerminals().includes(name)) name += suffix;
        return name;
    }
}


class Token {
    constructor(
        public readonly name: Terminal,
        public readonly value?: string
    ) {}
}
    
type ParseTable = Map<NonTerminal,Map<Terminal,number>>;
type ParseTree = StrayTree<NonTerminal | Token | typeof CFG.EOF | typeof CFG.LAMBDA>;

type NonTerminal = Opaque<string,'NonTerminal'>;
type Terminal = Opaque<string,'Terminal'>;
type CFGRuleBody = (NonTerminal|Terminal)[];
type CFGRule = [NonTerminal, CFGRuleBody];

type Stack<T> = {
    push: Array<T>['push'],
    pop: Array<T>['pop'],
    length: Array<T>['length'],
    [Symbol.iterator]: Array<T>[typeof Symbol.iterator]
}