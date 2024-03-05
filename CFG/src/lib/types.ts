///#pragma once
class CFG {
    constructor(
        public readonly rules: Map<NonTerminal,CFGRuleSet>,
        public readonly startingSymbol: NonTerminal,
        public readonly terminals: Set<Terminal>
    ) {}

    derivesToLambda(L: NonTerminal, T: SearchableStack<CFGRule> = []): boolean {
        const P = this.rules;
        for(const p of (P.get(L) ?? [])) {
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
            for(const X of p.filter(x=>CFG.isNonTerminal(x))) {
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
    
    static isTerminal(string: string): string is Terminal {
        return string.toLowerCase() === string;
    }
    
    static isNonTerminal(string: string): string is NonTerminal {
        return string.toLowerCase() !== string;
    }
    
    firstSet([X,...B]:string[], T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
        const EOF = '$';
        const P = this.rules;
    
        if(X === undefined) {
            return [new Set(),T];
        }
        if(X === EOF || CFG.isTerminal(X)) {
            return [new Set([X]), T];
        }
    
        const F = new Set<Terminal>();
        if(!T.has(X)) {
            T.add(X);
            for(const p of (P.get(X) ?? []).map(x=>[X,x])) {
                const [lhs,rhs] = p;
                const [G,I] = this.firstSet(this.startingSymbol === X ? [...rhs, EOF] : rhs,T);
                F.takeUnion(G);
            }
        }
    
        if(this.derivesToLambda(X) && B.length) {
            const [G,I] = this.firstSet(B,T);
            F.takeUnion(G);
        }
    
        return [F,T];
    }
    
    followSet(A: NonTerminal, T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
        const P = this.rules;
    
        if(T.has(A)) {
            return [new Set(), T];
        }
    
        T.add(A);
        
        const F = new Set<Terminal>();
        
        for(const p of [...P.entries()].flatMap(([sym,rs])=>rs.flatMap(rule=>rule.includes(A) ? [[sym,rule] as [string, CFGRule]] : []))) {
            const [lhs,rhs] = p;
            for(const [i,gamma] of [...rhs.entries()].filter(([_,x])=>x===A)) {
                const pi = rhs.slice(i+1);
    
                if(pi.length) {
                    const [G,I] = this.firstSet(pi, new Set());
                    F.takeUnion(G);
                }
    
                if(!pi.length || (
                    pi.every(x=>CFG.isNonTerminal(x))
                    && pi.every(x=>this.derivesToLambda(x))
                )) {
                    if(lhs === this.startingSymbol) {
                        F.add('$');
                    }
                    const [G,I] = this.followSet(lhs,T);
                    F.takeUnion(G);
                }
            }
        }
    
        return [F,T];
    }
    
    predictSet([lhs,rhs]: [NonTerminal,CFGRule]): Set<Terminal> {
        const F = this.firstSet(rhs)[0];
        if(rhs.every(x=>this.derivesToLambda(x))) {
            [...this.followSet(lhs)[0].values()].forEach(x=>F.add(x));
        }
        return F;
    }
}

type NonTerminal = string;
type Terminal = string;
type CFGRuleSet = CFGRule[];
type CFGRule = string[];

type Stack<T> = {
    push(t:T): void,
    pop(): T | undefined,
    length: number
}

type SearchableStack<T> = Stack<T> & {
    includes(t: T): boolean
}