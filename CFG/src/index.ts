///#include "lib/types.ts"
///#include "lib/peek.ts"
///#include "lib/io.ts"
///#include "lib/tree.ts"
(function() {
    const cfg = readCFG('data/complicated-first.tok.cfg');

    console.log('Non-Terminals:');
    console.log(cfg.getNonTerminals().map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('Terminals:');
    console.log(cfg.getTerminals().map(x=>`'${x}'`).join(', '));
    console.log();

    console.log('Rules:')
    let i = 0;
    for(const [lhs,rhs] of cfg.getRuleList()) {
        const ruleBody = rhs.length > 0 ? lhs === cfg.startingSymbol ? [...rhs,'$'].join(' ') : rhs.join(' ') : CFG.LAMBDA;
        console.log(`(${(i++).toString().padStart(~~(cfg.getRuleList().length/10)+2,' ')})\t${lhs} -> ${ruleBody}`); 
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
    for(const [lhs,rhs] of cfg.getRuleList()) {
        const ruleBody = (rhs.length > 0 ? rhs.join(' ') : CFG.LAMBDA) + (lhs === cfg.startingSymbol ? ' $' : '');
        console.log(`(${(i++).toString().padStart(~~(cfg.getRuleList().length/10)+2,' ')})\t'${lhs} -> ${ruleBody}': {${[...cfg.predictSet([lhs,rhs]).values()].join(', ')}}`); 
    }
    console.log()

    console.log('Parse Table:');
    try {
        const parseTable = cfg.toParseTable();
        const k = Math.max(...cfg.getNonTerminals().map(x=>x.length));
        const j = Math.max(...cfg.getTerminalsAndEOF().map(x=>x.length), i%9) + 1;
        console.log(`${''.padEnd(k)} | ${cfg.getTerminalsAndEOF().map(x => x.padStart(j)).join(' ')}`);
        console.log('-'.repeat(k+3+(j+1)*cfg.getTerminalsAndEOF().length));
        for(const [N,row] of parseTable) {
            console.log(`${N.padEnd(k)} | ${row.values().map(x=>(x===-1?' ':x.toString()).padStart(j)).toArray().join(' ')}`);
        }
    } catch(e) {
        console.error(e.message);
    }

    system.writeFile('data/parsetree.json',JSON.stringify(parseLL1(cfg,readTokens('data/complicated-first.tok').values()),undefined,2));
})();


function parseLL1(cfg: CFG, tokens: Iterator<Token>): ParseTree {
    const LLT = cfg.toParseTable();
    const P = cfg.getRuleList();
    const ts = createPeekableIterator(tokens);
    const MARKER = Symbol(), LAMBDA = Symbol();

    type TreeT = NonTerminal | Token | typeof CFG.EOF | typeof CFG.LAMBDA;
    const T: StrayTree<TreeT> = new Tree<TreeT>(undefined as unknown as Token) as StrayTree<TreeT>;
    const K: Stack<NonTerminal | Terminal | typeof MARKER | typeof LAMBDA> = [];

    let Current: Tree<TreeT> = T;
    K.push(cfg.startingSymbol);

    while(K.length) {
        let x: NonTerminal | Terminal | typeof MARKER | typeof LAMBDA | Token = K.pop()!;
        if(x === MARKER) {
            Current = Current.parent!;
        } else if(x === LAMBDA) {
            Current.push(new Tree(CFG.LAMBDA));
        } else if(CFG.isNonTerminal(x)) {
            let p = P[LLT.get(x)?.get(ts.peek()?.name!) ?? throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name}`))];
            K.push(MARKER);
            const R = p[1];
            
            if(p[0] === cfg.startingSymbol) {
                K.push(CFG.EOF);
            }

            if(R.length) {
                K.push(...[...R].reverse());
            } else {
                K.push(LAMBDA);
            }

            const n = new Tree<TreeT>(x);
            Current.push(n);
            Current = Current.at(-1)!;
        } else if(CFG.isTerminal(x)) {
            if(x !== ts.peek()?.name) throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name}`));
            x = ts.pop()!;
            Current.push(new Tree(x));
        } else if(CFG.isEOF(x)) {
            if(ts.peek() !== undefined) throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name}`));
            Current.push(new Tree(CFG.EOF));
        }
    }

    if(T.length !== 1) throws(new Error(`Syntax Error: Unexpected token ${ts.peek()?.name}`));

    return T.pop()!;
}