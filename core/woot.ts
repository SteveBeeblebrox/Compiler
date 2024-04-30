#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib -M "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <tape.ts>

///#include "cfg.ts"
///#include "zlang.ts"
///#include "scanner.ts"

namespace ZLang {
    console.log('Building Scanner...');
    const SCANNER = Scanner.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.lut"
    ])), 'zlex.json.lz');
    console.log('Done!');


    export async function* tokenizeFile(file: string) {
        const inStream = await system.createTextFileReadStream(file);
        yield* SCANNER.tokenize((function*() {
            while(true) yield inStream.read(1) as char;
        })());
    }

    export function tokenize(text: string) {
        return SCANNER.tokenize(text.split('')[Symbol.iterator]());
    }
}

// start and accepting are not saved when reading dfa to/from file!
// console.log(JSON.parse(LZCompression.decompressFromUint8Array(system.readFileSync('zlex.json.lz'))))

console.log('Tokens:')
console.log(ZLang.tokenize(`
1+1
`).toArray().join('\n'))
