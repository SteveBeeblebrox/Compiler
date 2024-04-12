#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>
///#include <range.ts>

///#include <graphviz.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

namespace RegexEngine {
    namespace NFAGen {
        export type NFAState = Opaque<number,'NFAState'>
        export type LambdaEdge = [start: NFAState, end: NFAState];
        export type StructuralEdge = [...LambdaEdge, char];
        export type NFA = {
            start: NFAState,
            end: NFAState,
            edges: (StructuralEdge | LambdaEdge)[],
        }
        export class NFAContext {
            constructor(public readonly alphabet: ReadonlySet<char>) {}
        
            private readonly iter = (function*(i = 0) {
                while(true) yield i++ as NFAState;
            })();
        
            public createState(): NFAState {
                return this.iter.shift();
            }

            public createStates(n: number = 1): NFAState[] {
                return [...this.iter.shift(n)];
            }

            public lambdaWrap(nfa: NFA): NFA {
                const [start, end] = this.createStates(2);
                return {
                    start,
                    end,
                    edges: [[start,nfa.start], ...nfa.edges, [nfa.end,end]]
                }
            }
        }
        export interface NFAConvertible {
            toNFA(ctx: NFAContext): NFA;
        }
    }
    export import NFAContext = NFAGen.NFAContext;
    export import NFA = NFAGen.NFA;
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
                const [start,end] = ctx.createStates(2);
                const nfa = {start, end, edges: []};

                for(const subgraph of this.nodes[Symbol.iterator]().map(node => node.toNFA(ctx))) {
                    nfa.edges.push([start,subgraph.start]);
                    nfa.edges.push(...subgraph.edges);
                    nfa.edges.push([subgraph.end,end]);
                }

                return ctx.lambdaWrap(nfa);
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
                const [start,end] = ctx.createStates(2);
                const nfa = {start, end, edges: []};

                let prev = nfa.start;
                for(const subgraph of this.nodes[Symbol.iterator]().map(node => node.toNFA(ctx))) {
                    nfa.edges.push([prev,subgraph.start])
                    nfa.edges.push(...subgraph.edges);
                    prev = subgraph.end;
                }
                nfa.edges.push([prev,nfa.end]);

                return ctx.lambdaWrap(nfa);
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
                const [start,end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: range(this.min, this.max).filter(char => ctx.alphabet.has(char)).map(char => [start,end,char] as NFAGen.StructuralEdge).toArray()
                });
            }
        }
        
        export class KleenNode extends RegexNode {
            constructor(private readonly node: RegexNode) {super();}
            readonly [Graphviz.label] = '*';
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof KleenNode>,this>)(this.node.clone());
            }
            public toNFA(ctx: NFAContext): NFA {
                const state = ctx.createState();
                const nfa = {start: state, end: state, edges: []};

                const subgraph = this.node.toNFA(ctx);

                nfa.edges.push([state, subgraph.start]);

                nfa.edges.push(...subgraph.edges);

                nfa.edges.push([subgraph.end, state]);

                return ctx.lambdaWrap(nfa);
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
                const [start, end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: [[start,end,this.char]]
                });
            }
        }

        export class WildcharNode extends RegexNode {
            // TODO, it might be better to support wildchars and charsets in the matcher to reduce nfa size?
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof WildcharNode>,this>)();
            }
            public toNFA(ctx: NFAContext): NFA {
                const [start,end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: ctx.alphabet.values().map(char => [start, end, char] as NFAGen.StructuralEdge).toArray()
                });
            }
        }
        
        export class LambdaNode extends RegexNode {
            readonly [Graphviz.label] = CFG.LAMBDA_CHARACTER;
            public override clone() {
                return new (this.constructor as Constructor<ConstructorParameters<typeof LambdaNode>,this>)();
            }
            public toNFA(ctx: NFAContext): NFA {
                const [start,end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: [[start,end]]
                });
            }
        }
    }
    export import RegexNode = TreeNodes.RegexNode;

    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        ///#embed "regex.cfg"
    ])));

    const PARSER = new LL1Parser<RegexNode>(GRAMMAR, new Map(Object.entries({
        '*'(node: LL1Parser.ParseTreeNode) {
            if(node.length === 1) {
                if(node.at(0) instanceof LL1Parser.ParseTreeLambdaLeaf) {
                    // Remove empty lambdas
                    return null;
                } else {
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
            if(node.length === 1) return node.shift()
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
        const ctx = new NFAContext(new Set(alphabet));
        const [start,end] = ctx.createStates(2);
        const ast = RegexEngine.parse(text);
        const nfa = ast.toNFA(ctx);
        return {
            start,
            end,
            edges: [[start, nfa.start], ...nfa.edges, [nfa.end, end]],
        };
    }
}

///#if __MAIN__
function nfaToGraphviz(nfa: RegexEngine.NFA) {
    const data = [];
    data.push('digraph {');
    data.push('\trankdir="LR"')
    data.push('\tnode[shape=circle]');
    data.push(`\t-1[label="",shape=plaintext,fixedsize=true,width=0.02,height=0.02]`);
    data.push(`\t-1->${nfa.start}`)
    data.push(`\t${nfa.start}`);
    data.push(`\t${nfa.end}[shape=doublecircle]`);

    for(const edge of nfa.edges) {
        data.push(`\t${edge[0]}->${edge[1]}[label=${JSON.stringify(edge[2] ?? CFG.LAMBDA_CHARACTER)}]`);
    }

    data.push('}');
    return data.join('\n')
}

if(system.args.length === 2 || system.args.length === 3) {
    const format = system.args[2]??'json';
    const ast = RegexEngine.parse(system.args[1]);
    if('json'.startsWith(format)) {
        console.log(JSON.stringify(ast,undefined,2));
    } else if('graphviz'.startsWith(format) || 'dot'.startsWith(format)) {
        console.log(Graphviz.serialize(ast));
    } else if('nfa'.startsWith(format)) {
        console.log(nfaToGraphviz(RegexEngine.compile(system.args[1], [...range('a','d')])));
    } else {
        throw new Error(`Unknown format '${format}'!`)
    }
} else {
    throw new Error('Expected one regex argument and an optional format argument!');
}

/*
async function dump(name: string, node: RegexEngine.RegexNode) {
    //@ts-ignore
    const dot = new system.Command('dot', {
        args: ['-Tpng', `-odata/${name}.png`],
        stdin: 'piped'
    }).spawn();
    
    const writer = dot.stdin.getWriter()
    await writer.write(new TextEncoder().encode(nfaToGraphviz(node.toNFA(new RegexEngine.NFAContext(new Set(['a','b','c','d','e','f']))))));
    await writer.ready;
    await writer.close();
}

// Creates pngs in data/
dump('alt', RegexEngine.parse('a|b'));
dump('complexalt', RegexEngine.parse('ab|c-d'));
dump('seq', RegexEngine.parse('ab'));
dump('range', RegexEngine.parse('a-d'));
dump('kleen', RegexEngine.parse('a*'));
dump('char', RegexEngine.parse('a'));
dump('dot', RegexEngine.parse('.'));
dump('lambda', RegexEngine.parse('a|'));

// console.log(RegexEngine.parse('ab').toNFA(new RegexEngine.NFAContext(['a','b','c'])))
*/
///#endif