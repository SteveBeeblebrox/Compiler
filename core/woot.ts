#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include "zlang.ts"
///#include "regex.ts"
///#include <compat.ts>

namespace ZLang {

}

const lines = new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.lut"
])).split('\n').map(line => line.trim()).filter(line=>line && !line.startsWith('#'));
const alphabet = lines.shift()!.split(/\s+/g).flatMap(x=>alphaDecode(x).split(''));

const lambdaCharacter: char = (function(alphabet: Set<char>) {
    for(const c of range(String.fromCharCode(1), String.fromCharCode(127))) {
        if(!alphabet.has(c)) return c;
    }
    console.error('Error: No sutible lambda ascii character found!');
    system.exit(8);
})(new Set(alphabet));

for(const line of lines) {
    const [regex,name,value] = line.split(/\s+/g);
    const nfa = (function() {
        try {
            return RegexEngine.compile(regex,alphabet);
        } catch(e) {
            if(e instanceof Parsing.SyntaxError) {
                console.error(`Regex Syntax Error${e.message ? `: ${e.message}` :''}${e.pos ? ` at ${e.pos.line}:${e.pos.col}` : ''}`);
                system.exit(1);
            }
            console.error(`Regex Semantic Error${e.message ? `: ${e.message}` :''}`);
            system.exit(1)
        }
    })();
}