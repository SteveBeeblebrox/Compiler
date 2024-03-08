///#include "lib/types.ts"
///#include "lib/peek.ts"
///#include "lib/io.ts"
///#include "lib/tree.ts"
///#include "lib/ll1.ts"

// Note, some of the optimizations can't see through  A -> B -> C rules
// Ideally, we'd optimize those out first, but that's nyi (or maybe compare with first sets?)

(function() {
    const [cfgSrc,tokenSrc,treeDest] = ['data/regex.cfg',,,];['data/complicated-first.tok.cfg', 'data/complicated-first.tok','data/parsetree.json']
    const cfg = LL1.applyGrammarTransforms(readCFG(cfgSrc));

    console.log('# Non-Terminals:');
    console.log('# '+cfg.getNonTerminals().map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('# Terminals:');
    console.log('# '+cfg.getTerminals().map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('# Rules:')
    let i = 0;
    for(const [lhs,rhs] of cfg.getRuleList()) {
        const ruleBody = rhs.length > 0 ? cfg.isStartingRule(lhs) ? [...rhs,'$'].join(' ') : rhs.join(' ') : CFG.LAMBDA;
        console.log(`# (${(i++).toString().padStart(~~(cfg.getRuleList().length/10)+2,' ')})\t${lhs} -> ${ruleBody}`); 
    }
    console.log();

    console.log('# Starting Symbol:');
    console.log(`# '${cfg.startingSymbol}'`);
    console.log();

    console.log('# Derives to Lambda:');
    cfg.getNonTerminals().forEach(x=>console.log(`# '${x}': ${cfg.derivesToLambda(x)}`));
    console.log();

    console.log('# First Sets:');
    cfg.getNonTerminals().forEach(x=>console.log(`# '${x}': {${[...cfg.firstSet([x])[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('# Follow Sets:');
    cfg.getNonTerminals().forEach(x=>console.log(`# '${x}': {${[...cfg.followSet(x)[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('# Predict Sets:');
    i = 0;
    for(const [lhs,rhs] of cfg.getRuleList()) {
        const ruleBody = (rhs.length > 0 ? rhs.join(' ') : CFG.LAMBDA) + (lhs === cfg.startingSymbol ? ' $' : '');
        console.log(`# (${(i++).toString().padStart(~~(cfg.getRuleList().length/10)+2,' ')})\t'${lhs} -> ${ruleBody}': {${[...cfg.predictSet([lhs,rhs]).values()].join(', ')}}`); 
    }
    console.log();

    console.log('# Parse Table:');
    try {
        const parseTable = cfg.toParseTable();
        const k = Math.max(...cfg.getNonTerminals().map(x=>x.length));
        const j = Math.max(...cfg.getTerminalsAndEOF().map(x=>x.length), i%9) + 1;
        console.log(`# ${''.padEnd(k)} | ${cfg.getTerminalsAndEOF().map(x => x.padStart(j)).join(' ')}`);
        console.log('# '+'-'.repeat(k+3+(j+1)*cfg.getTerminalsAndEOF().length));
        for(const [N,row] of parseTable) {
            console.log(`# ${N.padEnd(k)} | ${row.values().map(x=>(x===-1?' ':x.toString()).padStart(j)).toArray().join(' ')}`);
        }
    } catch(e) {
        console.error(e.message);
    }
    console.log()

    if(tokenSrc && treeDest) {
        system.writeFile(treeDest,JSON.stringify(LL1.parse(cfg,readTokens(tokenSrc).values()),undefined,2));
    }

    
    console.log('# Formatted Grammar:');
    console.log(cfg.getNonTerminals().map(N => `${N} -> ${cfg.getRuleListFor(N).map(r=>cfg.stringifyRule(r,false)).join('\n\t| ')}`).join('\n'));
})();

