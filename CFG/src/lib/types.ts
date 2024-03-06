///#pragma once
namespace OpaqueTypes {
    declare const type: unique symbol;
    export type Opaque<T,Ident> = T & {[type]:Ident};
}
type Opaque<T,Ident> = OpaqueTypes.Opaque<T,Ident>;

class CFG {
    public static readonly EOF = '$' as Terminal & '$';
    constructor(
        public readonly rules: Map<NonTerminal,CFGRuleSet>,
        public readonly startingSymbol: NonTerminal,
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

    public derivesToLambda(L: NonTerminal | Terminal, T: SearchableStack<CFGRule> = []): boolean {
        const P = this.rules;
        for(const p of (P.get(L as NonTerminal) ?? [])) {
            if(T.includes(p)) {
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

    public static isTerminal(string: string): string is Terminal {
        return string.toLowerCase() === string;
    }
    
    public static isNonTerminal(string: string): string is NonTerminal {
        return string.toLowerCase() !== string;
    }
    
    public firstSet([X,...B]:(Terminal|NonTerminal)[], T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
        const P = this.rules;
    
        if(X === undefined) {
            return [new Set(),T];
        }
        if(X === CFG.EOF || CFG.isTerminal(X)) {
            return [new Set([X]), T];
        }
    
        const F = new Set<Terminal>();
        if(!T.has(X)) {
            T.add(X);
            for(const p of (P.get(X) ?? [] as CFGRuleSet[]).map(x=>[X,x])) {
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
        
        for(const p of [...P.entries()].flatMap(([sym,rs])=>rs.flatMap(rule=>rule.includes(A) ? [[sym,rule] as [NonTerminal, CFGRule]] : []))) {
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
                    if(lhs === this.startingSymbol) {
                        F.add(CFG.EOF);
                    }
                    const [G,I] = this.followSet(lhs,T);
                    F.takeUnion(G);
                }
            }
        }
    
        return [F,T];
    }
    
    public predictSet([lhs,rhs]: [NonTerminal,CFGRule]): Set<Terminal> {
        const F = this.firstSet(rhs)[0];
        if(rhs.every(x=>this.derivesToLambda(x))) {
            [...this.followSet(lhs)[0].values()].forEach(x=>F.add(x));
        }
        return F;
    }

    public toParseTable(): ParseTable {
        let i = 0;
        const table: ParseTable = new Map(this.getNonTerminals().map(N=>[N,new Map(this.getTerminalsAndEOF().map(a => [a,-1]))]));
        for(const [lhs,rules] of this.rules.entries()) {
            if(rules.reduce((S,rhs) => {
                const P = this.predictSet([lhs,rhs]);
                for(const a of P) {
                    table.get(lhs)!.set(a,i);
                }
                i++;
                return S.takeIntersection(P);
            }, new Set()).size != 0) {
                throw new Error(`Grammar is not LL(1) (Caused by '${lhs}')`);
            }
        }
        return table;
    }
}

type ParseTable = Map<NonTerminal,Map<Terminal,number>>;

class Token {
    constructor(
        public readonly name: string,
        public readonly value?: string
    ) {}
}

class ParseTree {

}


type NonTerminal = Opaque<string,'NonTerminal'>;
type Terminal = Opaque<string,'Terminal'>;
type CFGRuleSet = CFGRule[];
type CFGRule = (NonTerminal|Terminal)[];

type Stack<T> = {
    push(t:T): void,
    pop(): T | undefined,
    length: number
}

type SearchableStack<T> = Stack<T> & {
    includes(t: T): boolean
}