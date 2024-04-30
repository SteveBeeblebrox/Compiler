#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include "zlang.ts"
///#include <compat.ts>

namespace ZLang {
    
}

///#include "regex.ts"

class Scanner {
    private constructor(public readonly alphabet: ReadonlySet<char>, public readonly lambdaChar: char, private readonly patterns: Map<string,{dfa:FiniteAutomata.DFA,value:string}>) {}
    public static fromString(text: string, cache?: string): Scanner {
        // Try to load from cache
        try {
            if(cache !== undefined) {
                const {signature,alphabet,patterns,lambdaChar} = JSON.parse(system.readTextFileSync(cache));
                if(Signature.create(text) === signature) {
                    return new Scanner(
                        new Set(alphabet),
                        lambdaChar,
                        new Map(
                            patterns.map(([k,{dfa,value}])=>[k,{dfa: new Map(dfa.map(([k,v])=>[k,new Map(v)])),value}])
                        )
                    );
                }
            }
        } catch(e) {}

        const lines = text.split('\n').map(line => line.trim()).filter(line=>line && !line.startsWith('#'));
        const alphabet = new Set(lines.shift()!.split(/\s+/g).flatMap(x=>alphaDecode(x).split('')));

        const lambdaCharacter: char = (function(alphabet: Set<char>) {
            for(const c of range(String.fromCharCode(1), String.fromCharCode(127))) {
                if(!alphabet.has(c)) return c;
            }
            console.error('Error: No sutible lambda ascii character found!');
            system.exit(8);
        })(new Set(alphabet));

        const patterns = new Map();
        const ctx =  new FiniteAutomata.NFAContext(alphabet);

        for(const line of lines) {
            const [regex,name,value] = line.split(/\s+/g);

            console.debug(`Compiling regex ${name}...`)

            const nfa = RegexEngine.compile(regex,alphabet);
            const dfa = FiniteAutomata.optimizeDFA(FiniteAutomata.toDFA(nfa,ctx),ctx);

            patterns.set(name, {
                dfa, value: value ?? name
            });
        }

        const scanner = new Scanner(alphabet, lambdaCharacter, patterns);
        
        // Save to cache
        try {
            if(cache !== undefined) {
                system.writeTextFileSync(cache,JSON.stringify({
                    signature: Signature.create(text),
                    alphabet: [...scanner.alphabet],
                    patterns: scanner.patterns.entries().map(([k,{dfa,value}]) => [k,{dfa:dfa.entries().map(([k,v])=>[k,v.entries().toArray()]).toArray(),value}]).toArray(),
                    lambdaCharacter
                }));
            }
        } catch(e) {}

        return scanner;
    }
}

console.log('Building Scanner...');
const SCANNER = Scanner.fromString(new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.lut"
])), 'zlex.json');
console.log('Done!');