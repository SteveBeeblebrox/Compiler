#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib $0) $@; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

namespace RegexEngine {
    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        ///#embed "regex.cfg"
    ])));
    
    export const PARSER = new LL1Parser(GRAMMAR);

    PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function(event: LL1Parser.CompleteNodeEvent) {
        console.error(`Finalized a ${event.node.value}`);
    });

    // Remove lambdas
    PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function(event: LL1Parser.CompleteNodeEvent) {
        if(event.node instanceof Tree && event.node.length === 1 && event.node.at(0).value === CFG.LAMBDA_CHARACTER) {
            event.node = null;
        }
    });

    // Squish tree
    PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function(event: LL1Parser.CompleteNodeEvent) {
        if(event.node instanceof Tree && event.node.length === 1) {
            event.node = event.node.pop();
        }
    });

    function isHex(text: string) {
        return text.split('').every(c => '0123456789abcdef'.includes(c.toLowerCase()));
    }
    
    export function* tokenize(text: string): IterableIterator<Token> {
        const iter = text[Symbol.iterator]();

        let c: char;
        while((c = iter.shift() as char) !== undefined) {
            switch(c) {
                case '\\': {
                    const e = iter.shift();
                    switch(e) {
                        case '\\':
                        case '(':
                        case ')':
                        case '+':
                        case '*':
                        case '-':
                        case '.':
                        case '|':
                            yield new Token('char',e);
                            break;
                        case 's':
                            yield new Token('char',' ');
                            break;
                        case 'n':
                            yield new Token('char','\n');
                            break;
                        case 'u':
                            const hex = iter.take(4).toArray().join('');
                            const n = Number.parseInt(hex,16);
                            if(hex.length != 4 || !isHex(hex) || Number.isNaN(n)) {
                                throw new Error(`Invalid unicode escape sequence '\\u${hex}'`);
                            }
                            yield new Token('char', String.fromCharCode(n));
                            break;
                        default:
                            throw new Error(`Unknown escape sequence '\\${e}'`);
                    }
                    break;
                };
                case '(':
                case ')':
                case '+':
                case '*':
                case '-':
                case '.':
                case '|':
                    yield new Token('%'+c,c);
                    break;
                default:
                    yield new Token('char', c);
                    break;
            }
        }
    }

    export function parse(text: string) {
        return PARSER.parse(tokenize(text));
    }
}

const PARSER = RegexEngine.PARSER;
PARSER.addEventListener('completenode', function(event: LL1Parser.CompleteNodeEvent) {
    const node = event.node;
    if(node instanceof Tree) {
        if(node.value === 'Primitive') {
            if(node.length === 1) {
                event.node=event.node.at(0)
            } else {
                //event.node=new Tree('RANGE');
            }
        }
    }
})

///#if __MAIN__
if(system.args.length == 2) {
    console.log(JSON.stringify(RegexEngine.parse(system.args[1]),undefined,2));
} else {
    throw new Error('Expected one regex argument!');
}
///#endif