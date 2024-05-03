#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <tape.ts>

///#include "cfg.ts"
///#include "zlang.ts"
///#include "scanner.ts"

namespace zZLang {
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

    export function parse(text: string): ZLang.Program {
        return ZLang.parseTokens(ZLang.tokenize(text)) as ZLang.Program;
    }
}

///#if __MAIN__
console.log('Tokens:')
console.log(ZLang.tokenize(`
int x = y = z = 3;
float k;
float m = n = k = 3.14;

`).map(x=>JSON.stringify(x)).toArray().join('\n'))
///#endif