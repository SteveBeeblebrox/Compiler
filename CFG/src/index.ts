///#include "lib/types.ts"
///#include "lib/io.ts"
(function() {
    const cfg = readCFG('data/challenge.cfg');

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
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': ${cfg.derivesToLambda(x)}`));
    console.log();

    console.log('First Sets:');
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': {${[...cfg.firstSet([x])[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('Follow Sets:');
    [...cfg.rules.keys()].forEach(x=>console.log(`'${x}': {${[...cfg.followSet(x)[0].values()].map(x=>`'${x}'`)}}`));
    console.log();

    console.log('Predict Sets:');
    i = 0;
    for(const [target,ruleSet] of cfg.rules.entries()) {
        for(const rule of ruleSet) {
            const ruleBody = (rule.length > 0 ? rule.join(' ') : '\u03bb') + (target === cfg.startingSymbol ? ' $' : '');
            console.log(`(${(i++).toString().padStart(~~(cfg.rules.size/10)+2,' ')})\t'${target} -> ${ruleBody}': {${[...cfg.predictSet([target,rule]).values()].join(', ')}}`); 
        }
    }
})();


