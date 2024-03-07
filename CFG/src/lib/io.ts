///#pragma once
///#include "compat.ts"
function readCFG(path: string, commentExtension = true): CFG {
    const SPECIAL_SYMBOLS = Object.assign(Object.create(null), {
        ARROW: '->',
        LAMBDA: 'lambda',
        OR: '|',
        EOF: CFG.EOF
    });
    const text = system.readFile(path);
    let tokens: string[] = []
    for(const line of text.split('\n').map(x=>x.trim())) {
        if(line.startsWith('#') && commentExtension)
            continue;

        tokens = tokens.concat(line.split(' ').filter(x=>x));
    }

    const rules: Map<NonTerminal,CFGRuleBody[]> = new Map();
    let startingSymbol: NonTerminal | null = null;
    const terminals: Set<Terminal> = new Set();

    while(tokens.length) {
        const target = tokens.shift()! as NonTerminal;
        if(tokens.shift() !== SPECIAL_SYMBOLS.ARROW)
            throw new Error(`Expected '${SPECIAL_SYMBOLS.ARROW}' after '${target}'!`);

        rules.set(target, rules.get(target) ?? []);
        const ruleSet = rules.get(target)!;

        let currentRule: string[];
        ruleSet.push(currentRule = []);

        while(tokens[1] !== SPECIAL_SYMBOLS.ARROW && tokens.length) {
            const token = tokens.shift()!;
            switch(token) {
                case SPECIAL_SYMBOLS.LAMBDA:
                case CFG.LAMBDA:
                    break;
                case SPECIAL_SYMBOLS.EOF:
                    if(startingSymbol === null)
                        startingSymbol = target;
                    else if(startingSymbol !== target)
                        throw new Error(`Multiple starting rules containing '${SPECIAL_SYMBOLS.EOF}' found!`);
                    break;
                case SPECIAL_SYMBOLS.OR:
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
        throw new Error(`No starting rule containing '${SPECIAL_SYMBOLS.EOF}' found!`);

    return new CFG(startingSymbol, rules, terminals);
}

function readTokens(path: string) {
    const text = system.readFile(path);
    // @ts-expect-error
    return text.split('\n').map(line=>line.trim()).filter(x=>x).map(line => new Token(...line.split(' ',2)));
}