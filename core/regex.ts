#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib $0) $@; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

namespace RegexEngine {
    namespace Nodes {
        export abstract class RegexNode extends Tree<string> {
            constructor() {
                super(undefined);
                this.value = this.constructor.name;
            }
        }
        
        export class AltNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
        }
        
        export class SeqNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
        }
        
        export class RangeNode extends RegexNode {
            constructor(private readonly min: char, private readonly max: char) {super();}
        }
        
        export class KleenNode extends RegexNode {
            constructor(private readonly node: RegexNode) {super();}
        }
        
        export class CharNode extends RegexNode {
            constructor(private readonly char: char) {super();}
        }
        
        export class LambdaNode extends RegexNode {
        }
    }
    import RegexNode = Nodes.RegexNode;

    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        ///#embed "regex.cfg"
    ])));

    export const PARSER = new LL1Parser<RegexNode>(GRAMMAR, new Map(Object.entries({
        '*'(node: LL1.ParseTree<any>) {
            if(node.length === 1) {
                if(node.at(0).value === CFG.LAMBDA_CHARACTER) {
                    // Remove empty lambdas
                    return null;
                } else {
                    // Squish tree
                    return node.pop();
                }
            } else if(typeof node.value === 'string' && node.value.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            }
        },
        Primitive(node) {
            
        }
    }) as any));

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

///#if __MAIN__
if(system.args.length == 2) {
    console.log(JSON.stringify(RegexEngine.parse(system.args[1]),undefined,2));
} else {
    throw new Error('Expected one regex argument!');
}
///#endif