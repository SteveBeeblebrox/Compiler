///#pragma once
///#include <compat.ts>
///#include <regex.ts>
///#include <encoding.ts>
///#include <types.ts>
///#include <range.ts>
///#include <ll1.ts>


///<reference path="../../lib/compat.ts"/> // Make VS Code happy 
///<reference path="../../core/regex.ts"/> // Make VS Code happy
///<reference path="../../lib/encoding.ts"/> // Make VS Code happy
///<reference path="../../lib/types.ts"/> // Make VS Code happy
///<reference path="../../lib/range.ts"/> // Make VS Code happy
///<reference path="../../core/ll1.ts"/> // Make VS Code happy


const IO_ERROR = 1, SYNTAX_ERROR = 2, SEMANTIC_ERROR = 3;

if(system.args.slice(1).length < 1) {
    console.error('Expected at least one argument!')
    system.exit();
}

const [lexFile,outFile] = system.args.slice(1);
const lines = (function() {
    try {
        return (system.readTextFileSync(lexFile)?.trim() || throws(new Error('No text!'))).split(/\r?\n/g);
    } catch(e) {
        console.error(e?.message ?? 'IO Error!')
        system.exit(IO_ERROR);
    }
})();


const alphabet = lines.shift()!.split(/\s+/g).flatMap(x=>alphaDecode(x).split(''));
console.log(`Alphabet: ${alphabet.map(x => alphaEncode(x)).join(' ')}`);


const uFileOutput: string[] = [];
uFileOutput.push(alphabet.map(x => alphaEncode(x)).join(' '));


const lambdaCharacter: char = (function(alphabet: Set<char>) {
    for(const c of range(String.fromCharCode(1), String.fromCharCode(127))) {
        if(!alphabet.has(c)) return c;
    }
    console.error('No sutible lambda ascii character found!');
    system.exit(8);
})(new Set(alphabet));

console.log(`Chose ${alphaEncode(lambdaCharacter)} for lambda`)

for(const line of lines) {
    const [regex,name,value] = line.split(/\s+/g);
    console.log(`Compiling ${name}...`)
    const nfa = (function() {
        try {
            return RegexEngine.compile(regex,alphabet);
        } catch(e) {
            if(e instanceof LL1Parser.SyntaxError) {
                console.error(`Syntax Error${e.message ? `: ${e.message}` :''}${e.pos ? ` at ${e.pos.line}:${e.pos.col}` : ''}`);
                system.exit(SYNTAX_ERROR);
            }
            console.error(`Semantic Error${e.message ? `: ${e.message}` :''}`);
            system.exit(SEMANTIC_ERROR)
        }
    })();
    
    uFileOutput.push(`${name}.tt ${name} ${value ?? ''}`.trim());

    try {
        const nfaFileOutput: string[] = [];

        nfaFileOutput.push(`${nfa.edges.length} ${alphaEncode(lambdaCharacter)} ${alphabet.map(x => alphaEncode(x)).join(' ')}`);

        for(const edge of nfa.edges) {
            nfaFileOutput.push(`${edge[1] === 1 ? '+' : '-'} ${edge[0]} ${edge[1]} ${alphaEncode(edge[2] ?? lambdaCharacter)}`);
        }

        system.writeTextFileSync(`${name}.nfa`, nfaFileOutput.join('\n'));
    } catch(e) {
        console.error(e?.message ?? 'IO Error!');
        system.exit(IO_ERROR);
    }
}

try {
    system.writeTextFileSync(outFile??lexFile.replace(/\.[^.]+$/g,'.u'), uFileOutput.join('\n'));
} catch(e) {
    console.error(e?.message ?? 'IO Error!');
    system.exit(IO_ERROR);
}