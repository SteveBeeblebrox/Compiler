///#pragma once
///#include "compat.ts"
///#include "encoding.ts"


function readLanguageDefinition(path: string): LanguageDefinition {
    const text = system.readFile(path).trim();
    if(!text) {
        throw new Error(`${path} is empty!`)
    }
    
    const language = new LanguageDefinition();

    const [alphabet,...body] = text.split('\n').map(x=>x.trim());
    language.alphabet=alphaDecode(alphabet.replace(/\s+/g,'')).split('') as char[]

    for(const line of body) {
        if(!line || line.startsWith('#')) {
            continue;
        }

        const [src,name,value] = line.split(/\s+/g);

        language.tokenTypes.push(new TokenType(name,readTokenTable(src),alphaDecode(value)));
    }

    return language;
}

function readTokenTable(path: string): TransitionTable {
    const text = system.readFile(path).trim();
    if(!text) {
        throw new Error(`${path} is empty!`)
    }

    const table: TransitionTable = []
    for(const line of text.split('\n').map(x=>x.trim())) {
        if(!line || line.startsWith('#')) {
            continue;
        }
        const [type,id,...transitions] = line.split(/\s+/g);
        table[+id] = {accepting: type === '+', data: transitions.map(i=>i==='E'?null:+i)};
    }

    return table;
}