#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <types.ts>

///#include "lex.ts"

class CFG {
    public static readonly EOF = undefined as unknown as Terminal;
    public static readonly EOF_CHARACTER = '$';
    public static readonly LAMBDA_CHARACTER = '\u03bb';
    constructor(
        public readonly startingSymbol: NonTerminal,
        private readonly rules: Map<NonTerminal,CFG.CFGRuleBody[]>,
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

    public getGrammarSymbols(): [typeof CFG.EOF, ...(NonTerminal | Terminal)[]] {
        return [CFG.EOF, ...this.getTerminals(), ...this.getNonTerminals()];
    }

    public isStartingRule(rule: NonTerminal | CFG.CFGRule) {
        if(typeof rule !== 'string') return this.isStartingRule(rule[0]);
        return rule === this.startingSymbol;
    }

    public static isTerminal(string: string): string is Terminal {
        return !this.isEOF(string) && !this.isLambda(string) && string.toLowerCase() === string && string.length >= 1;
    }
    
    public static isTerminalOrEOF(string: string): string is Terminal | typeof CFG.EOF {
        return CFG.isEOF(string) || CFG.isTerminal(string);
    }

    public static isEOF(string: string): string is typeof CFG.EOF {
        return string === CFG.EOF;
    }

    public static isLambda(string: string): string is typeof CFG.LAMBDA_CHARACTER {
        return string === CFG.LAMBDA_CHARACTER;
    }

    public static isNonTerminal(arg: any): arg is NonTerminal {
        return typeof arg === 'string' && !this.isEOF(arg) && !this.isLambda(arg) && arg.toLowerCase() !== arg && arg.length >= 1;
    }

    public derivesToLambda(L: NonTerminal | Terminal, T: Stack<CFG.CFGRuleBody> = []): boolean {
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
            for(const p of (P.get(X) ?? [] as CFG.CFGRuleBody[][]).map(x=>[X,x])) {
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
    
    public followSet(A: NonTerminal, T: Set<NonTerminal> = new Set()): Set<Terminal> {
        const followSet = (function(A: NonTerminal, T: Set<NonTerminal> = new Set()): [Set<Terminal>,Set<NonTerminal>] {
            const P = this.rules;
        
            if(T.has(A)) {
                return [new Set(), T];
            }
        
            T.add(A);
            
            const F = new Set<Terminal>();
            
            for(const p of [...P.entries()].flatMap(([sym,rs])=>rs.flatMap(rule=>rule.includes(A) ? [[sym,rule] as [NonTerminal, CFG.CFGRuleBody]] : []))) {
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
                        const [G,I] = followSet(lhs,T);
                        F.takeUnion(G);
                    }
                }
            }
        
            return [F,T];
        }).bind(this);

        return followSet(A,T)[0];
    }
    
    public predictSet([lhs,rhs]: CFG.CFGRule): Set<Terminal> {
        const F = this.firstSet(rhs)[0];
        if(rhs.every(x=>this.derivesToLambda(x))) {
            [...this.followSet(lhs).values()].forEach(x=>F.add(x));
        }
        return F;
    }

    public getRuleList(): CFG.CFGRule[] {
        return this.rules.entries().flatMap(([lhs,rules])=>rules.flatMap(rhs => [[lhs,rhs]])).toArray() as CFG.CFGRule[];
    }

    public getRuleListFor(lhs: NonTerminal): CFG.CFGRule[] {
        return this.rules.get(lhs)!.map(rhs => [lhs,rhs]);
    }

    public static makeUniqueNonTerminal(cfg: CFG, name: NonTerminal, suffix='\''): NonTerminal {
        // @ts-expect-error
        while(cfg.getNonTerminals().includes(name)) name += suffix;
        return name;
    }

    public stringifyRule(rule: CFG.CFGRule, lhs = true): string {
        if(lhs) return `${rule[0]} -> ${this.stringifyRule(rule, false)}`;
        else return (rule[1].length ? rule[1].join(' ') : CFG.LAMBDA_CHARACTER) + (this.isStartingRule(rule) ? ' ' + CFG.EOF_CHARACTER : '');
    }

    public stringifySet(set: Set<Terminal | NonTerminal>): string {
        return `{${set.values().map(
            c => c === CFG.EOF
                ? CFG.EOF_CHARACTER
                : `'${JSON.stringify(c).slice(1,-1).replace(/'/g,'\\\'').replace(/\\"/g,'"')}'`
        ).toArray().join(', ')}}`;
    }

    public static fromString(text: string, allowComments = true) {
        const cfgKeywords = Object.assign(Object.create(null), {
            ARROW: '->',
            UC_LAMBDA: CFG.LAMBDA_CHARACTER,
            LAMBDA: 'lambda',
            OR: '|',
            EOF: CFG.EOF_CHARACTER
        });

        const tokens: string[] = []
        for(const line of text.split('\n').map(x=>x.trim())) {
            if(line.startsWith('#') && allowComments)
                continue;

            tokens.push(...line.split(' ').filter(x=>x));
        }

        const rules: Map<NonTerminal,CFG.CFGRuleBody[]> = new Map();
        let startingSymbol: NonTerminal | null = null;
        const terminals: Set<Terminal> = new Set();
    
        while(tokens.length) {
            const target = tokens.shift()! as NonTerminal;
            if(tokens.shift() !== cfgKeywords.ARROW)
                throw new Error(`Expected '${cfgKeywords.ARROW}' after '${target}'!`);
    
            rules.set(target, rules.get(target) ?? []);
            const ruleSet = rules.get(target)!;
    
            let currentRule: string[];
            ruleSet.push(currentRule = []);
    
            while(tokens[1] !== cfgKeywords.ARROW && tokens.length) {
                const token = tokens.shift()!;
                switch(token) {
                    case cfgKeywords.LAMBDA:
                    case cfgKeywords.UC_LAMBDA:
                        break;
                    case cfgKeywords.EOF:
                        if(startingSymbol === null)
                            startingSymbol = target;
                        else if(startingSymbol !== target)
                            throw new Error(`Multiple starting rules containing '${cfgKeywords.EOF}' found!`);
                        break;
                    case cfgKeywords.OR:
                        ruleSet.push(currentRule = []);
                        break;
                    default:
                        if(CFG.isTerminal(token))
                            terminals.add(token);
    
                        currentRule.push(token);
                        break;
                }
            }
        }
    
        if(startingSymbol === null)
            throw new Error(`No starting rule containing '${cfgKeywords.EOF}' found!`);
    
        return new CFG(startingSymbol, rules, terminals);
    }

    public cfsm() {
        return new SLR1.CFSM(this);
    }
}

type NonTerminal = Opaque<string,'NonTerminal'>;
type Terminal = Opaque<string,'Terminal'>;
namespace CFG {
    export type CFGRuleBody = (NonTerminal|Terminal)[];
    export type CFGRule = [NonTerminal, CFGRuleBody];
    export type GrammarSymbol = Terminal | NonTerminal | typeof CFG.EOF;
}


///#if __MAIN__



///#endif