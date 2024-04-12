#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>

///#include <graphviz.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

namespace RegexEngine {
    namespace NFAGen {
        export type NFAState = Opaque<number,'NFAState'>
        export type LambdaEdge = [start: NFAState, end: NFAState];
        export type StructuralEdge = [char, ...LambdaEdge];
        export type NFA = {
            start: NFAState,
            end: NFAState,
            structuralEdges: StructuralEdge[],
            lambdaEdges: LambdaEdge[]
        }
        export class NFAContext {
            constructor(public readonly alphabet: ReadonlyArray<char>) {}
        
            private readonly iter = (function*(i = 0) {
                while(true) yield i++ as NFAState;
            })();
        
            public createState(): NFAState {
                return this.iter.shift();
            }

            public lambdaWrap(nfa: NFA) {
                ///#warning lambdaWrap nyi
                return nfa;
            }
        }
        export interface NFAConvertible {
            toNFA(ctx: NFAContext): NFA;
        }
    }
    import NFAContext = NFAGen.NFAContext;
    import NFA = NFAGen.NFA;
    namespace TreeNodes {
        export abstract class RegexNode extends Tree implements NFAGen.NFAConvertible {
            public readonly name = this.constructor.name;
            public abstract clone(): typeof this;
            public abstract toNFA(ctx: NFAContext): NFA;
        }
        
        export class AltNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
            public getChildNodes() {
                return [...this.nodes];
            }
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof AltNode>,this>)(this.nodes.map(node=>node.clone()));
            }
            public toNFA(ctx: NFAContext): NFA {
                // chain in parallel
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                // nfa.start = ctx.createState();
                // nfa.end = ctx.createState();
                for (var ch of this.getChildNodes()) {
                    let cnfa = ch.toNFA(ctx);
                    nfa.lambdaEdges.push([nfa.start, cnfa.start]);
                    nfa.lambdaEdges.push([cnfa.end, nfa.end]);
                    nfa.structuralEdges = [...nfa.structuralEdges, ...cnfa.structuralEdges];
                    nfa.lambdaEdges = [...nfa.lambdaEdges, ...cnfa.lambdaEdges];
                }
                return nfa;
                // throw new Error('NYI');
            }
        }
        
        export class SeqNode extends RegexNode {
            constructor(private readonly nodes: RegexNode[]) {super();}
            public getChildNodes() {
                return [...this.nodes];
            }
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof SeqNode>,this>)(this.nodes.map(node=>node.clone()));
            }
            public toNFA(ctx: NFAContext): NFA {
                // lambda # a # b # c # ... # z # lambda
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                let cs = nfa.start;
                nfa.lambdaEdges.push([nfa.start, cs]);
                for (var rn of this.getChildNodes()) {
                    let cnfa = rn.toNFA(ctx);
                    nfa.lambdaEdges.push([cs, cnfa.start]);
                    cs = cnfa.end;
                    nfa.structuralEdges = [...nfa.structuralEdges, ...cnfa.structuralEdges];
                    nfa.lambdaEdges = [...nfa.lambdaEdges, ...cnfa.lambdaEdges];
                }
                nfa.lambdaEdges.push([cs, nfa.end]);
                return nfa;
                // throw new Error('NYI');
            }
        }
        
        export class RangeNode extends RegexNode {
            constructor(private readonly min: char, private readonly max: char) {super();}
            get [Graphviz.children]() {
                return {
                    min: Graphviz.text(this.min),
                    max: Graphviz.text(this.max),
                }
            }
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof RangeNode>,this>)(this.min,this.max);
            }
            public toNFA(ctx: NFAContext): NFA {
                // lambda # char for each char # lambda
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                let i = ctx.alphabet.find(e => e == this.min);
                while (ctx.alphabet[i] != this.max) {
                    let ch = new CharNode(ctx.alphabet[i]);
                    let cnfa = ch.toNFA(ctx);
                    nfa.lambdaEdges.push([nfa.start, cnfa.start]);
                    nfa.lambdaEdges.push([nfa.end, cnfa.end]);
                    nfa.structuralEdges = [...nfa.structuralEdges, ...cnfa.structuralEdges];
                    nfa.lambdaEdges = [...nfa.lambdaEdges, ...cnfa.lambdaEdges];
                    i += 1;
                }
                return nfa;
                // throw new Error('NYI');
            }
        }
        
        export class KleenNode extends RegexNode {
            constructor(private readonly node: RegexNode) {super();}
            readonly [Graphviz.label] = '*';
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof KleenNode>,this>)(this.node.clone());
            }
            public toNFA(ctx: NFAContext): NFA {
                // lambda # node with loopback # lambda
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                let cnfa = this.node.toNFA(ctx);
                nfa.lambdaEdges.push([nfa.start, cnfa.start]);
                nfa.lambdaEdges.push([nfa.end, cnfa.end]);
                nfa.lambdaEdges.push([cnfa.start, cnfa.end]);
                nfa.lambdaEdges.push([cnfa.end, cnfa.start]);
                nfa.structuralEdges = [...nfa.structuralEdges, ...cnfa.structuralEdges];
                nfa.lambdaEdges = [...nfa.lambdaEdges, ...cnfa.lambdaEdges];
                return nfa
                // throw new Error('NYI');
            }
        }
        
        export class CharNode extends RegexNode {
            constructor(private readonly char: char) {super();}
            get [Graphviz.label]() {
                return this.char;
            }
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof CharNode>,this>)(this.char);
            }
            public toNFA(ctx: NFAContext): NFA {
                // let stateone = ctx.createState();
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                // nfa.start = ctx.createState();
                // nfa.end = ctx.createState();
                nfa.structuralEdges.push([this.char, nfa.start, nfa.end]);
                return nfa;
                // throw new Error('NYI');
            }
        }

        export class WildcharNode extends RegexNode {
            // maybe refactor as a range node or just add one for each char
            // TODO, it might be better to support wildchars and charsets in the matcher to reduce nfa size?
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof WildcharNode>,this>)();
            }
            public toNFA(ctx: NFAContext): NFA {
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                for (var c of ctx.alphabet) {
                    let ch = new CharNode(c);
                    let cnfa = ch.toNFA(ctx);
                    nfa.lambdaEdges.push([nfa.start, cnfa.start]);
                    nfa.lambdaEdges.push([nfa.end, cnfa.end]);
                    nfa.structuralEdges = [...nfa.structuralEdges, ...cnfa.structuralEdges];
                    nfa.lambdaEdges = [...nfa.lambdaEdges, ...cnfa.lambdaEdges];
                }
                return nfa;
            }
        }
        
        export class LambdaNode extends RegexNode {
            // lambda # lambda # lambda
            readonly [Graphviz.label] = CFG.LAMBDA_CHARACTER;
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof LambdaNode>,this>)();
            }
            public toNFA(ctx: NFAContext): NFA {
                let nfa: NFA = {start:ctx.createState(), 
                    end:ctx.createState(), 
                    structuralEdges:[],
                    lambdaEdges:[]
                };
                nfa.lambdaEdges.push([nfa.start, nfa.end]);
                return nfa;
            }
        }
    }
    import RegexNode = TreeNodes.RegexNode;

    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        ///#embed "regex.cfg"
    ])));

    const PARSER = new LL1Parser<RegexNode>(GRAMMAR, new Map(Object.entries({
        '*'(node: LL1Parser.ParseTreeNode) {
            if(node.length === 1) {
                if(node.at(0) instanceof LL1Parser.ParseTreeLambdaLeaf) {
                    // Remove empty lambdas
                    return null;
                } else if(node.name !== 'Primitive') {
                    // Squish tree
                    return node.pop();
                }
            } else if(node.name.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            }
        },
        Primitive(node) {
            const [first,,second] = [...node] as LL1Parser.ParseTreeTokenLeaf[];
            if(first.name === 'char' && second?.name === 'char') {
                return new TreeNodes.RangeNode(first.value as char, second.value as char);
            } else if(first.name === 'char') {
                return new TreeNodes.CharNode(first.value as char);
            } else if(first.name === '%.') {
                return new TreeNodes.WildcharNode();
            }
        },
        Sequence(node) {
            return new TreeNodes.SeqNode([...node].flatMap(node => node instanceof TreeNodes.SeqNode ? node.getChildNodes() : [node as RegexNode]) as RegexNode[]);
        },
        Alternation(node) {
            const l = node.length;
            const children = node.splice(0,node.length).filter(x=>x instanceof RegexNode) as RegexNode[];
            // Joining n items requires n-1 separators. if 2n-1 != num children, there exists an extra %|
            if(2*children.length-1 !== l) {
                children.push(new TreeNodes.LambdaNode());
            }
            return new TreeNodes.AltNode(children); // Todo, flatten this?
        },
        Quantifier(node) {
            const mod = node.at(1);
            if(mod instanceof LL1Parser.ParseTreeTokenLeaf) {
                switch(mod.name) {
                    case '%+': return new TreeNodes.SeqNode([node.at(0) as RegexNode, new TreeNodes.KleenNode((node.shift() as RegexNode).clone())]);
                    case '%*': return new TreeNodes.KleenNode(node.shift() as RegexNode);
                }
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

    export function parse(text: string): RegexNode {
        return PARSER.parse(tokenize(text)) as RegexNode;
    }

    export function compile(text: string, alphabet: char[]): NFA {
        const ctx = new NFAContext(alphabet);
        const ast = RegexEngine.parse(text);
        const nfa = ast.toNFA(ctx);
        ///#warning ensure state 0 is start and 1 is end, add 2x lambdas
        return {...nfa};
    }
}

///#if __MAIN__
if(system.args.length === 2 || system.args.length === 3) {
    const format = system.args[2]??'json';
    const ast = RegexEngine.parse(system.args[1]);
    if(format === 'json') {
        console.log(JSON.stringify(ast,undefined,2));
    } else if(format === 'graphviz' || format === 'dot') {
        console.log(Graphviz.serialize(ast));
    } else if(format === 'nfa') {
        console.log(RegexEngine.compile(system.args[1], ['a','b','c','d']));
    }
} else {
    throw new Error('Expected one regex argument and an optional format argument!');
}
///#endif