#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib $0) $@; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

namespace RegexEngine {
    namespace AstNodes {
        export abstract class RegexNode extends Tree<string> {
            constructor() {
                super(undefined);
                this.value = this.constructor.name;
                // @ts-ignore TODO, refactor a base type for Tree
                delete this.children;
            }
        }
        
        export class AltNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
            // chain in parallel
        }
        
        export class SeqNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
            // lambda # a # b # c # ... # z # lambda
        }
        
        export class RangeNode extends RegexNode {
            constructor(private readonly min: char, private readonly max: char) {super();}
            // lambda # char for each char # lambda
        }
        
        export class KleenNode extends RegexNode {
            constructor(private readonly node: RegexNode) {super();}
            // lambda # node with loopback # lambda
        }
        
        export class CharNode extends RegexNode {
            constructor(private readonly char: char) {super();}
            // lambda # char # lambda
        }

        export class WildcharNode extends RegexNode {
            // maybe refactor as a range node or just add one for each char
            // TODO, it might be better to support wildchars and charsets in the matcher to reduce nfa size?
        }
        
        export class LambdaNode extends RegexNode {
            // lambda # lambda # lambda
        }
    }
    import RegexNode = AstNodes.RegexNode;

    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        ///#embed "regex.cfg"
    ])));

    export const PARSER = new LL1Parser<RegexNode>(GRAMMAR, new Map(Object.entries({
        '*'(node: LL1.ParseTree<any>) {
            if(node.length === 1) {
                if(node.at(0).value === CFG.LAMBDA_CHARACTER) {
                    // Remove empty lambdas
                    return null;
                } else if(node.value !== 'Primitive') {
                    // Squish tree
                    return node.pop();
                }
            } else if(typeof node.value === 'string' && node.value.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            }
        },
        Primitive(node) {
            const [first,,second] = [...node].map(x=>x.value) as (Token|undefined)[];
            if(first.name === 'char' && second?.name === 'char') {
                return new AstNodes.RangeNode(first.value as char, second.value as char);
            } else if(first.name === 'char') {
                return new AstNodes.CharNode(first.value as char);
            } else if(first.name === '%.') {
                return new AstNodes.WildcharNode();
            }
        },
        Sequence(node) {
            return new AstNodes.SeqNode([...node] as RegexNode[]); // Todo, flatten this?
        },
        Alternation(node) {
            const l = node.length;
            const children = node.splice(0,node.length).filter(x=>x instanceof RegexNode) as RegexNode[];
            // Joining n items requires n-1 separators. if 2n-1 != num children, there exists an extra %|
            if(2*children.length-1 !== l) {
                children.push(new AstNodes.LambdaNode());
            }
            return new AstNodes.AltNode(children); // Todo, flatten this?
        },
        Quantifier(node) {
            switch((node.at(1).value as Token).name) {
                case '%+': return new AstNodes.SeqNode([node.at(0) as RegexNode, new AstNodes.KleenNode(node.shift() as RegexNode)]);
                case '%*': return new AstNodes.KleenNode(node.shift() as RegexNode);
            }
        },
        Primary(node) {
            return node.length === 1 ? node.shift() : node.splice(1,1);
        },
        S(node) {
            return node.shift();
        }
    })) as LL1.SyntaxTransformerMap<RegexNode>);

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