///#include "lib/types.ts"
///#include "lib/io.ts"
(function() {
    const cfg = readCFG('data/test.txt');

    console.log('Non-Terminals:');
    console.log([...cfg.rules.keys()].map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('Terminals:');
    console.log([...cfg.terminals.values()].map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('Rules:')
    let i = 0;
    for(const [target,ruleSet] of cfg.rules.entries()) {
        for(const rule of ruleSet) {
            const ruleBody = rule.length > 0 ? target === cfg.startingSymbol ? [...rule,'$'].join(' ') : rule.join(' ') : '\u03bb';
            console.log(`(${(i++).toString().padStart(~~(cfg.rules.size/10)+2,' ')})\t${target} -> ${ruleBody}`); 
        }
    }
    console.log();

    console.log('Starting Symbol:');
    console.log(`'${cfg.startingSymbol}'`);
    console.log();

    console.log('Derive to Lambda:');
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': ${derivesToLambda(cfg,x)}`));
    console.log();

    console.log('First Sets:');
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': {${[...firstSet(cfg,[x])[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('Follow Sets:');
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': {${[...followSet(cfg,x)[0].values()].map(x=>`'${x}'`)}}`));
    console.log();
})();

function derivesToLambda(cfg: CFG, L: NonTerminal, T: SearchableStack<CFGRule> = []): boolean {
    const P = cfg.rules;
    for(const p of (P.get(L) ?? [])) {
        if(T.includes(p)) {
            continue;
        }
        if(!p.length) {
            return true;
        }
        if(p.some(x=>isTerminal(x))) {
            continue;
        }
        let adl = true;
        for(const X of p.filter(x=>isNonTerminal(x))) {
            T.push(p);
            adl = derivesToLambda(cfg,X,T);
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

function isTerminal(string: string): string is Terminal {
    return string.toLowerCase() === string;
}

function isNonTerminal(string: string): string is NonTerminal {
    return string.toLowerCase() !== string;
}

function firstSet(cfg: CFG, [X,...B]:string[], T: Set<NonTerminal> = new Set()): [Set<NonTerminal>,Set<NonTerminal>] {
    const EOF = '$';
    const P = cfg.rules;

    if(X === undefined) {
        return [new Set(),T];
    }
    if(X === EOF || isTerminal(X)) {
        return [new Set([X]), T];
    }

    const F = new Set<NonTerminal>();
    if(!T.has(X)) {
        T.add(X);
        for(const p of (P.get(X) ?? []).map(x=>[X,x])) {
            const [lhs,rhs] = p;
            const [G,I] = firstSet(cfg,cfg.startingSymbol === X ? [...rhs, EOF] : rhs,T);
            G.forEach(x=>F.add(x));
        }
    }

    if(derivesToLambda(cfg,X) && B.length) {
        const [G,I] = firstSet(cfg,B,T);
        G.forEach(x=>F.add(x));
    }

    return [F,T];
}

function followSet(cfg: CFG, A: NonTerminal, T: Set<NonTerminal> = new Set()): [Set<NonTerminal>,Set<NonTerminal>] {
    const P = cfg.rules;

    if(T.has(A)) {
        return [new Set(), T];
    }

    T.add(A);
    
    const F = new Set<NonTerminal>();
    
    for(const p of [...P.entries()].flatMap(([sym,rs])=>rs.flatMap(rule=>rule.includes(A) ? [[sym,rule] as [string, CFGRule]] : []))) {
        const [lhs,rhs] = p;
        for(const [i,gamma] of [...rhs.entries()].filter(([_,x])=>x===A)) {
            const pi = rhs.slice(i+1);

            if(pi.length) {
                const [G,I] = firstSet(cfg, pi, new Set());
                G.forEach(x=>F.add(x));
            }

            if(lhs === cfg.startingSymbol) {
                F.add('$');
            }

            if(!pi.length || (
                lhs !== cfg.startingSymbol
                && pi.every(x=>isNonTerminal(x))
                && pi.every(x=>derivesToLambda(cfg,x))
            )) {
                const [G,I] = followSet(cfg,lhs,T);
                G.forEach(x=>F.add(x));
            }
        }
    }

    return [F,T];
}