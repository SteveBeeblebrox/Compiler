#!/usr/bin/bash
//`which sjs` <(mtsc -po- -Ilib $0) $@; exit $?

function require() {return {}}

///#pragma once
///#include <compat.ts>
///#include <types.ts>

class Token {
    constructor(
        public readonly name: string,
        public readonly value?: string
    ) {}
}





namespace RegexEngine {
    function isHex(text: string) {
        return text.split('').every(c => '0123456789abcdef'.includes(c.toLowerCase()));
    }
    export function* tokenize(text: string): IterableIterator<Token> {
        const LOOKAHEAD_SIZE = 6;
        const iter = text[Symbol.iterator]();
        const buffer = [...iter.take(LOOKAHEAD_SIZE)];

        while(buffer.length) {
            const c = buffer.shift();
            buffer.push(...iter.take(1));
            switch(c) {
                case '\\': {
                    const e = buffer.shift();
                    buffer.push(...iter.take(1));
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
                            const hex = buffer.splice(0,4).join('');
                            buffer.push(...iter.take(4));
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
}

console.log([...RegexEngine.tokenize(String.raw`A\s(a-z)*\u00ff`)])
