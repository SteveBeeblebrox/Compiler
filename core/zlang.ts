#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <signature.ts>
///#include <encoding.ts>

///#include "slr1.ts"
///#include "cfg.ts"


namespace ZLang {
    const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.cfg"
    ])));
    
    namespace TreeNodes {
        export abstract class ZNode extends Tree {
            public readonly name = this.constructor.name;
            get [Graphviz.label]() {
                return this.name;
            }
        }
        export abstract class ExpressionNode extends ZNode {
            
        }
        export class BinaryOp extends ExpressionNode {
            constructor(public override readonly name: string,public readonly lhs:ExpressionNode, public readonly rhs:ExpressionNode) {
                super();
            }
        }
        export class UnaryOp extends ExpressionNode {
            constructor(public override readonly name: string,public readonly val:ExpressionNode) {
                super();
            }
        }
        export class CastNode extends ExpressionNode {
            constructor(public type: Tree, public readonly val: ExpressionNode) {
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

        export class FunctionCallNode extends ExpressionNode {
            constructor(public override readonly name: string, public readonly args: ExpressionNode[]) {
                super();
            }
            get [Graphviz.label]() {
                return `${this.name}(...)`;
            }
        }

        export class FunctionNode extends ZNode {
            constructor(public readonly header: FunctionHeaderNode, public readonly rvar: string, public readonly rvalue: ExpressionNode, public readonly body: StatementGroup) {
                super();
            }
            get [Graphviz.label]() {
                return `${this.header[Graphviz.label]} {...}`;
            }
            get [Graphviz.children]() {
                return [['header',this.header],['var',new ParseTreeTokenNode('id' as Terminal, this.rvar)],['rvalue',this.rvalue], ['body',this.body]];
            }
        }

        export class Program extends ZNode {
            constructor(public readonly children: (StatementNode|FunctionNode)[]) {
                super();
            }
            get [Graphviz.label]() {
                return 'Program.z';
            }
            get [Graphviz.children]() {
                return this.children.map((n,i) => [`statements[${i}]`,n]);
            }
        }

        export class DomainNode extends ExpressionNode {
            constructor(public readonly value: ExpressionNode) {
                super();
            }
            get [Graphviz.label]() {
                return `Domain`;
            }
            get [Graphviz.children]() {
                return [['',this.value]];
            }
        }

        export abstract class StatementNode extends ZNode {
            constructor() {
                super();
            }
            get [Graphviz.label]() {
                return 'Statement';
            }
        }

        export class DeclareStatement extends StatementNode {
            constructor(public readonly type: TypeNode, public readonly entries: [string, ExpressionNode?][]) {
                super();
            }
            get [Graphviz.label]() {
                return 'Declare';
            }
            get [Graphviz.children]() {
                return [...Object.entries({type:this.type}), ...this.entries.map(function(entry,i) {
                    return entry.length === 1 ? ['',new ParseTreeTokenNode('id' as Terminal, entry[0])] : ['',{
                        get [Graphviz.label]() {
                            return '=';
                        },
                        get [Graphviz.children]() {
                            return [['',new ParseTreeTokenNode('id' as Terminal, entry[0])], ['',entry[1]]];
                        }
                    }];
                })];
            }
        }

        export  class AssignmentStatement extends StatementNode {
            constructor(public readonly id: string, public readonly value: ExpressionNode) {
                super();
            }
            get [Graphviz.label]() {
                return '=';
            }
            get [Graphviz.children]() {
                return [['id',new ParseTreeTokenNode('id' as Terminal, this.id)],...Object.entries({value:this.value})]
            }
        }

        export  class IfStatement extends StatementNode {
            constructor(public readonly predicate: ExpressionNode, public readonly btrue: StatementGroup, public readonly bfalse?: StatementGroup) {
                super();
            }
            get [Graphviz.label]() {
                return this.bfalse !== undefined ? 'If-Else' : 'If'
            }
        }

        export class DoWhileStatement extends StatementNode {
            constructor(public readonly body: StatementGroup, public readonly predicate: ExpressionNode) {
                super();
            }
            
            get [Graphviz.label]() {
                return 'Do While';
            }
        }

        export  class WhileStatement extends StatementNode {
            constructor(public readonly predicate: ExpressionNode, public readonly body: StatementGroup) {
                super();
            }
            get [Graphviz.label]() {
                return 'While';
            }
        }

        type EmitMeta = {
            readonly type: 'symbtable'
        } | {
            readonly type: 'value',
            readonly value: ExpressionNode
        } | {
            readonly type: 'string',
            readonly id: string,
            readonly index: ExpressionNode,
            readonly length: ExpressionNode
        }
        export class EmitStatement extends StatementNode {
            constructor(public readonly data: EmitMeta) {
                super();
            }
            get [Graphviz.label]() {
                return 'Emit'
            }
            get [Graphviz.children]() {
                return [...(this.data.type==='string' ? [['id',new ParseTreeTokenNode('id' as Terminal,this.data.id)]] : []),...Object.entries(this.data)];
            }
        }

        export class RandStatement extends StatementNode {
            constructor(public readonly id: string, public readonly min?: ExpressionNode, public readonly max?: ExpressionNode) {
                super();
            }
            get [Graphviz.label]() {
                return 'Rand';
            }
            get [Graphviz.children]() {
                return [['id',new ParseTreeTokenNode('id' as Terminal,this.id)],...[this.min !== undefined ? ['min',this.min] : []],...[this.max !== undefined ? ['max',this.max] : []]]
            }
        }

        export class StatementGroup extends StatementNode {
            constructor(public readonly statements: StatementNode[]) {
                super();
            }
            get [Graphviz.label]() {
                return 'Statements';
            }
        }
    }

    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    import ExpressionNode = TreeNodes.ExpressionNode;
    import StatementGroup = TreeNodes.StatementGroup;
    import Program = TreeNodes.Program;

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

        // Expressions
        'SUM|PRODUCT|BEXPR'(node) {
            if(node.length === 1) return;
            return new TreeNodes.BinaryOp((node.at(1) as ParseTreeTokenNode).value,node.shift() as ExpressionNode,node.pop() as ExpressionNode) as StrayTree<TreeNodes.BinaryOp>;
        },
        UNARY(node) {
            if(node.length === 1) return;
            return new TreeNodes.UnaryOp((node.at(0) as ParseTreeTokenNode).value,node.pop() as ExpressionNode) as StrayTree<TreeNodes.UnaryOp>;
        },
        CAST(node) {
            return new TreeNodes.CastNode(node.at(0), node.at(2) as ExpressionNode) as StrayTree<TreeNodes.CastNode>;
        },

        // Functions
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
        FUNCALL(node) {
            return new TreeNodes.FunctionCallNode((node.at(0) as ParseTreeTokenNode).value, node.splice(2,node.length-3) as ExpressionNode[]) as StrayTree<TreeNodes.FunctionCallNode>;
        },
        ARGLIST(node) {
            if(node.length === 1) return;
            node.splice(-2,1);
            return node.splice(0,node.length);
        },
        FUNCTION(node) {
            return new TreeNodes.FunctionNode(
                node.splice(0,1)[0] as TreeNodes.FunctionHeaderNode,
                (node.at(1) as ParseTreeTokenNode).value,
                node.splice(-2,1)[0] as ExpressionNode,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<TreeNodes.FunctionNode>;
        },
        
        // Types
        'OTHERTYPE|FUNTYPE'(node) {
            return new TreeNodes.TypeNode((node.at(-1) as ParseTreeTokenNode).value, {const: node.length > 1 && (node.at(0) as ParseTreeTokenNode).value === 'const'}) as StrayTree<TreeNodes.TypeNode>;
        },
        
        // General simplification
        MODULE(node) {
            return new TreeNodes.Program(node.splice(0,node.length - 1) as (TreeNodes.StatementNode | TreeNodes.FunctionNode)[]) as StrayTree<TreeNodes.Program>;
        },
        MODPARTS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'sc' : true);
        },
        VALUE(node) {
            if(node.length === 3) {
                return node.splice(1,1);
            } else if(node.length === 4) {
                return new TreeNodes.DomainNode(node.splice(2,1)[0] as ExpressionNode) as StrayTree<TreeNodes.DomainNode>;
            }
        },
        BSTMT(node) {
            return node.splice(0,1);
        },
        BSTMTS(node) {
            if(node.length === 1) return;
            return node.splice(0,node.length);
        },
        BRACESTMTS(node) {
            return new TreeNodes.StatementGroup(node.splice(1,node.length-2) as TreeNodes.StatementNode[]) as StrayTree<TreeNodes.StatementGroup>;
        },
        SOLOSTMT(node) {
            return new TreeNodes.StatementGroup(node.splice(0,1) as TreeNodes.StatementNode[]) as StrayTree<TreeNodes.StatementGroup>;
        },

        // Assignment and declaration
        ASSIGN(node) {
            return new TreeNodes.AssignmentStatement((node.at(0) as ParseTreeTokenNode).value, node.splice(-1,1)[0] as ExpressionNode) as StrayTree<TreeNodes.AssignmentStatement>;
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new TreeNodes.DeclareStatement(
                node.splice(0,1)[0] as TreeNodes.TypeNode,
                node.splice(0,node.length).map(x => x instanceof TreeNodes.AssignmentStatement ? [x.id, x.value] : [(x as ParseTreeTokenNode).value])
            ) as StrayTree<TreeNodes.DeclareStatement>;
        },
        DECLIDS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true);
        },

        // Control Statements
        WHILE(node) {
            return new TreeNodes.WhileStatement(node.splice(2,1)[0] as ExpressionNode,node.splice(-1,1)[0] as StatementGroup) as StrayTree<TreeNodes.WhileStatement>;
        },
        DOWHILE(node) {
            return new TreeNodes.DoWhileStatement(node.splice(1,1)[0] as StatementGroup, node.splice(-3,1)[0] as ExpressionNode) as StrayTree<TreeNodes.WhileStatement>;
        },
        IF(node) {
            return new TreeNodes.IfStatement(
                node.splice(2,1)[0] as ExpressionNode,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<TreeNodes.IfStatement>;
        },
        IFELSE(node) {
            return new TreeNodes.IfStatement(
                node.splice(2,1)[0] as ExpressionNode,
                node.splice(-3,1)[0] as StatementGroup,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<TreeNodes.IfStatement>;
        },

        // Special Statements
        EMIT(node) {
            switch(node.length) {
                case 2:
                    return new TreeNodes.EmitStatement({
                        type: (node.at(-1) as ParseTreeTokenNode).value as 'symbtable'
                    }) as StrayTree<TreeNodes.EmitStatement>;
                case 4:
                    return new TreeNodes.EmitStatement({
                        type: 'value',
                        value: node.splice(2,1)[0] as ExpressionNode
                    }) as StrayTree<TreeNodes.EmitStatement>;
                case 6:
                    return new TreeNodes.EmitStatement({
                        type: 'string',
                        id: (node.at(1) as ParseTreeTokenNode).value,
                        index: node.splice(3,1)[0] as ExpressionNode,
                        length: node.splice(-1,1)[0] as ExpressionNode
                    }) as StrayTree<TreeNodes.EmitStatement>;
            }
        },
        RAND(node) {
            switch(node.length) {
                case 2:
                    return new TreeNodes.RandStatement((node.at(1) as ParseTreeTokenNode).value) as StrayTree<TreeNodes.RandStatement>;
                case 6:
                    return new TreeNodes.RandStatement(
                        (node.at(1) as ParseTreeTokenNode).value,
                        node.splice(3,1)[0] as ExpressionNode,
                        node.splice(-1,1)[0] as ExpressionNode
                    ) as StrayTree<TreeNodes.RandStatement>;
            }
        }
    });
    
    console.debug('Building Parser...');
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, 'zlang.json');
    console.debug('Done.');

    export function parse(tokens: Iterable<Token>): Program {
        return PARSER.parse(tokens) as Program;
    }
}

///#if __MAIN__
async function dump(name: string, node: Tree, {format = 'png'} = {}) {
    //@ts-ignore
    const dot = new system.Command('dot', {
        args: [`-T${format}`, `-odata/${name}.${format}`],
        stdin: 'piped'
    }).spawn();
    
    const text = Graphviz.serialize(node);
    system.writeTextFileSync(`data/${name}.dot`,text);

    const writer = dot.stdin.getWriter()
    await writer.write(new TextEncoder().encode(text));
    await writer.ready;
    await writer.close();
}
console.debug('Parsing...');
const tokens = system.readTextFileSync(system.args[1]).trim().split('\n').filter(x=>x.trim()).map(x=>x.trim().split(' ')).map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}));
dump('zlang', ZLang.parse(tokens));
///#endif