#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>


///#include "slr1.ts"
///#include "cfg.ts"

///#include <signature.ts>
///#include <encoding.ts>

const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.cfg"
])));

console.log('Building parser...');

namespace ZLang {
    namespace TreeNodes {
        export abstract class ZNode extends Tree {
            public readonly name = this.constructor.name;
            get [Graphviz.label]() {
                return this.name;
            }
        }
        export class BinaryOp extends ZNode {
            constructor(public override readonly name: string,public readonly lhs:Tree,public readonly rhs:Tree) {
                super();
            }
        }
        export class UnaryOp extends ZNode {
            constructor(public override readonly name: string,public readonly val:Tree) {
                super();
            }
        }
        export class CastNode extends ZNode {
            constructor(public type: Tree, public readonly val: Tree) {
                super();
            }
            get [Graphviz.label]() {
                return this.type[Graphviz.label];
            }
            get [Graphviz.children]() {
                return [['',this.val]];
            }
        }

        export class ParameterNode extends ZNode {
            constructor(public type: Tree, public override readonly name: string) {
                super();
            }
            get [Graphviz.label]() {
                return `${this.type[Graphviz.label]} ${this.name}`;
            }
            
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionHeaderNode extends ZNode {
            constructor(public override readonly name: string, public readonly rtype: Tree, public readonly parameters: ParameterNode[]) {
                super();
            }
            get [Graphviz.label]() {
                return `fn ${this.name}(...)`;
            }
        }

        export class AssignmentNode extends ZNode {
            constructor(public override readonly name: string, public readonly value: Tree) {
                super();
            }
            get [Graphviz.label]() {
                return '=';
            }
            get [Graphviz.children]() {
                return [['',Graphviz.text(this.name)],['',this.value]]
            }
        }

        type TypeMeta = {const:boolean};
        export class TypeNode extends ZNode {
            constructor(public readonly type: string, public readonly meta: TypeMeta) {
                super();
            }
            get [Graphviz.label]() {
                return `${this.meta.const ? 'const ' : ''}${this.type}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionCallNode extends ZNode {
            constructor(public override readonly name: string, public readonly args: Tree[]) {
                super();
            }
            get [Graphviz.label]() {
                return `${this.name}(...)`;
            }
        }
    }

    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;

    export const sdt = new Parsing.SyntaxTransformer<TreeNodes.ZNode>({
        '*'(node: Parsing.ParseTreeNode) {
            if(node.length === 1) {
                if(node.at(0) instanceof Parsing.ParseTreeLambdaNode) {
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
        MODULE(node) {
            node.pop();
            return node;
        },
        'SUM|PRODUCT|BEXPR'(node) {
            if(node.length === 1) return;
            return new TreeNodes.BinaryOp((node.at(1) as ParseTreeTokenNode).value,node.shift(),node.pop()) as StrayTree<TreeNodes.BinaryOp>;
        },
        UNARY(node) {
            if(node.length === 1) return;
            return new TreeNodes.UnaryOp((node.at(0) as ParseTreeTokenNode).value,node.pop()) as StrayTree<TreeNodes.UnaryOp>;
        },
        CAST(node) {
            return new TreeNodes.CastNode(node.at(0), node.at(2)) as StrayTree<TreeNodes.CastNode>;
        },
        FUNSIG(node) {
            return new TreeNodes.FunctionHeaderNode((node.at(1) as ParseTreeTokenNode).value, node.at(0), node.children.splice(3,node.length-4) as TreeNodes.ParameterNode[]) as StrayTree<TreeNodes.FunctionHeaderNode>
        },
        PARAMLIST(node) {
            if(node.length === 1) return;
            if(node.length === 2) {
                return new TreeNodes.ParameterNode(node.at(0), (node.at(1) as ParseTreeTokenNode).value) as StrayTree<TreeNodes.ParameterNode>;
            } else {
                return [new TreeNodes.ParameterNode(node.at(0), (node.at(1) as ParseTreeTokenNode).value), ...node.splice(3,node.length)] as StrayTree<TreeNodes.ParameterNode>[];
            }
        },
        ASSIGN(node) {
            // return new TreeNodes.AssignmentNode((node.at(0) as ParseTreeTokenNode).value, node.at(2)) as StrayTree<TreeNodes.AssignmentNode>;
        },
        FUNCALL(node) {
            return new TreeNodes.FunctionCallNode((node.at(0) as ParseTreeTokenNode).value, node.splice(2,node.length-3)) as StrayTree<TreeNodes.FunctionCallNode>;
        },
        ARGLIST(node) {
            if(node.length === 1) return;
            node.splice(-2,1);
            return node.splice(0,node.length);
        },
        'MODPARTS'(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'sc' : true)
        },
        'OTHERTYPE|FUNTYPE'(node) {
            return new TreeNodes.TypeNode((node.at(-1) as ParseTreeTokenNode).value, {const: node.length > 1 && (node.at(0) as ParseTreeTokenNode).value === 'const'}) as StrayTree<TreeNodes.TypeNode>;
        }
    });
}

const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, 'zlang.json');

async function dump(name: string, node: Tree, {format = 'png'} = {}) {
    //@ts-ignore
    const dot = new system.Command('dot', {
        args: [`-T${format}`, `-odata/${name}.${format}`],
        stdin: 'piped'
    }).spawn();
    
    const writer = dot.stdin.getWriter()
    await writer.write(new TextEncoder().encode(Graphviz.serialize(node)));
    await writer.ready;
    await writer.close();
}
console.log('Parsing...');
const tokens = system.readTextFileSync(system.args[1]).trim().split('\n').map(x=>x.trim().split(' ')).map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}));
dump('zlang', PARSER.parse(tokens));