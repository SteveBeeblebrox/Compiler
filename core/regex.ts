#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib $0) $@; exit $?

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
}

///#if __MAIN__
console.log([...RegexEngine.tokenize(String.raw`A\s(a-z)*\u00ff`)])
///#endif