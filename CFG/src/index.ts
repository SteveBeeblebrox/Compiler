///#include "lib/types.ts"
///#include "lib/io.ts"
(function() {
    const cfg = readCFG('data/challenge.cfg');

    console.log('Non-Terminals:');
    console.log(cfg.getNonTerminals().map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('Terminals:');
    console.log(cfg.getTerminals().map(x=>`'${x}'`).join(', '));
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
    cfg.getNonTerminals().forEach(x=>console.log(`'${x}': ${cfg.derivesToLambda(x)}`));
    console.log();

    console.log('First Sets:');
    cfg.getNonTerminals().forEach(x=>console.log(`'${x}': {${[...cfg.firstSet([x])[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('Follow Sets:');
    cfg.getNonTerminals().forEach(x=>console.log(`'${x}': {${[...cfg.followSet(x)[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('Predict Sets:');
    i = 0;
    for(const [target,ruleSet] of cfg.rules.entries()) {
        for(const rule of ruleSet) {
            const ruleBody = (rule.length > 0 ? rule.join(' ') : '\u03bb') + (target === cfg.startingSymbol ? ' $' : '');
            console.log(`(${(i++).toString().padStart(~~(cfg.rules.size/10)+2,' ')})\t'${target} -> ${ruleBody}': {${[...cfg.predictSet([target,rule]).values()].join(', ')}}`); 
        }
    }

    console.log('Parse Table:');
    try {
        const table = cfg.toParseTable();
        const k = Math.max(...cfg.getNonTerminals().map(x=>x.length));
        const j = Math.max(...cfg.getTerminalsAndEOF().map(x=>x.length), i%9) + 1;
        console.log(`${''.padEnd(k)} | ${cfg.getTerminalsAndEOF().map(x => x.padStart(j)).join(' ')}`);
        console.log('-'.repeat(k+3+(j+1)*cfg.getTerminalsAndEOF().length));
        for(const [N,row] of table) {
            console.log(`${N.padEnd(k)} | ${row.values().map(x=>(x===-1?' ':x.toString()).padStart(j)).toArray().join(' ')}`);
        }
    } catch(e) {
        console.error(e.message);
    }
    
    console.log();
})();


function parse(cfg: CFG[], tokens: Iterator<Token>): ParseTree {


    throw null;
}