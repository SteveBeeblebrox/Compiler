#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <signature.ts>
///#include <encoding.ts>

///#include "slr1.ts"
///#include "cfg.ts"


namespace ZLang {
    function escapeString(text: string) {
        return JSON.stringify(text).slice(1,-1).replace(/'/g,'\\\'').replace(/\\"/g,'"');
    }

    const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.cfg"
    ])));
    
    export namespace Nodes {
        export abstract class ZNode extends Tree {
            public readonly name = this.constructor.name;
            get [Graphviz.label]() {
                return this.name;
            }
            public abstract get children(): ZNode[];
        }
        export abstract class ExpressionNode extends ZNode {
            public abstract get domain(): string;
        }
        export abstract class LiteralNode<T> extends ExpressionNode {
            constructor(public readonly type: string, public readonly value: T) {super()};
            get children() {
                return [];
            }
            get domain() {
                return this.type;
            }
        }
        export class IntLiteral extends LiteralNode<number> {
            constructor(value: number) {
                super('int',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
        }
        export class FloatLiteral extends LiteralNode<number> {
            constructor(value: number) {
                super('float',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
        }
        export class StringLiteral extends LiteralNode<string> {
            constructor(value: string) {
                super('string',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${escapeString(this.value)}`;
            }
        }
        export class BinaryOp extends ExpressionNode {
            constructor(public override readonly name: string,public readonly lhs:ExpressionNode, public readonly rhs:ExpressionNode) {
                super();
            }
            get children() {
                return [this.lhs,this.rhs];
            }
            get domain() {
                return 'any';
            }
        }
        export class UnaryOp extends ExpressionNode {
            constructor(public override readonly name: string,public readonly val:ExpressionNode) {
                super();
            }
            get children() {
                return [this.val];
            }
            get domain() {
                return 'any';
            }
        }
        export class CastNode extends ExpressionNode {
            constructor(public type: TypeNode, public readonly val: ExpressionNode) {
                super();
            }
            get children() {
                return [this.type,this.val];
            }
            get domain() {
                return 'any';
            }
            get [Graphviz.label]() {
                return this.type[Graphviz.label];
            }
            get [Graphviz.children]() {
                return [['',this.val]];
            }
        }

        export class ParameterNode extends ZNode {
            constructor(public type: TypeNode, public override readonly name: string) {
                super();
            }
            get children() {
                return [this.type];
            }
            get [Graphviz.label]() {
                return `${this.type[Graphviz.label]} ${this.name}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionHeaderNode extends ZNode {
            constructor(public override readonly name: string, public readonly rtype: TypeNode, public readonly parameters: ParameterNode[]) {
                super();
            }
            get children() {
                return [this.rtype,...this.parameters,this];
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
            get children() {
                return [];
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
            get children() {
                return [...this.args];
            }
            get domain() {
                return 'any';
            }
            get [Graphviz.label]() {
                return `${this.name}(...)`;
            }
        }

        export class FunctionNode extends ZNode {
            constructor(public readonly header: FunctionHeaderNode, public readonly rvar: string, public readonly rvalue: ExpressionNode, public readonly body: StatementGroup) {
                super();
            }
            get children() {
                return [this.header,this.rvalue,this.body];
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
            constructor(public readonly value: ExpressionNode,public readonly pos: Position) {
                super();
            }
            get children() {
                return [this.value];
            }
            get domain() {
                return this.value.domain;
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
            get children() {
                return [this.type, ...this.entries.flatMap(x=>x.length > 1 ? x[1] : [])];
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
            get children() {
                return [this.value];
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
            get children() {
                return [this.predicate,this.btrue,...(this.bfalse !== undefined ? [this.bfalse] : [])];
            }
            get [Graphviz.label]() {
                return this.bfalse !== undefined ? 'If-Else' : 'If'
            }
        }

        export class DoWhileStatement extends StatementNode {
            constructor(public readonly body: StatementGroup, public readonly predicate: ExpressionNode) {
                super();
            }
            get children() {
                return [this.body,this.predicate];
            }
            get [Graphviz.label]() {
                return 'Do While';
            }
        }

        export  class WhileStatement extends StatementNode {
            constructor(public readonly predicate: ExpressionNode, public readonly body: StatementGroup) {
                super();
            }
            get children() {
                return [this.predicate,this.body];
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
            get children() {
                switch(this.data.type) {
                    case 'value': return [this.data.value];
                    case 'string': return [this.data.index,this.data.length];
                }
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
            get children() {
                return [...(this.min !== undefined ? [this.min] : []), ...(this.max !== undefined ? [this.max] : [])];
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
            get children() {
                return [...this.statements];
            }
            get [Graphviz.label]() {
                return 'Statements';
            }
        }
    }

    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    import ExpressionNode = Nodes.ExpressionNode;
    import StatementGroup = Nodes.StatementGroup;
    export import Program = Nodes.Program;

    export const sdt = new Parsing.SyntaxTransformer<Nodes.ZNode>({
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
            return new Nodes.BinaryOp((node.at(1) as ParseTreeTokenNode).value,node.shift() as ExpressionNode,node.pop() as ExpressionNode) as StrayTree<Nodes.BinaryOp>;
        },
        UNARY(node) {
            if(node.length === 1) return;
            return new Nodes.UnaryOp((node.at(0) as ParseTreeTokenNode).value,node.pop() as ExpressionNode) as StrayTree<Nodes.UnaryOp>;
        },
        CAST(node) {
            return new Nodes.CastNode(node.at(0) as Nodes.TypeNode, node.at(2) as ExpressionNode) as StrayTree<Nodes.CastNode>;
        },

        // Functions
        FUNSIG(node) {
            return new Nodes.FunctionHeaderNode((node.at(1) as ParseTreeTokenNode).value, node.at(0) as Nodes.TypeNode, node.children.splice(3,node.length-4) as Nodes.ParameterNode[]) as StrayTree<Nodes.FunctionHeaderNode>
        },
        PARAMLIST(node) {
            if(node.length === 1) return;
            if(node.length === 2) {
                return new Nodes.ParameterNode(node.at(0) as Nodes.TypeNode, (node.at(1) as ParseTreeTokenNode).value) as StrayTree<Nodes.ParameterNode>;
            } else {
                return [new Nodes.ParameterNode(node.at(0) as Nodes.TypeNode, (node.at(1) as ParseTreeTokenNode).value), ...node.splice(3,node.length)] as StrayTree<Nodes.ParameterNode>[];
            }
        },
        FUNCALL(node) {
            return new Nodes.FunctionCallNode((node.at(0) as ParseTreeTokenNode).value, node.splice(2,node.length-3) as ExpressionNode[]) as StrayTree<Nodes.FunctionCallNode>;
        },
        ARGLIST(node) {
            if(node.length === 1) return;
            node.splice(-2,1);
            return node.splice(0,node.length);
        },
        FUNCTION(node) {
            return new Nodes.FunctionNode(
                node.splice(0,1)[0] as Nodes.FunctionHeaderNode,
                (node.at(1) as ParseTreeTokenNode).value,
                node.splice(-2,1)[0] as ExpressionNode,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<Nodes.FunctionNode>;
        },
        
        // Types
        'OTHERTYPE|FUNTYPE'(node) {
            return new Nodes.TypeNode((node.at(-1) as ParseTreeTokenNode).value, {const: node.length > 1 && (node.at(0) as ParseTreeTokenNode).value === 'const'}) as StrayTree<Nodes.TypeNode>;
        },
        
        // General simplification
        MODULE(node) {
            return new Nodes.Program(node.splice(0,node.length - 1) as (Nodes.StatementNode | Nodes.FunctionNode)[]) as StrayTree<Nodes.Program>;
        },
        MODPARTS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'sc' : true);
        },
        VALUE(node) {
            if(node.length === 3) {
                return node.splice(1,1);
            } else if(node.length === 4) {
                const pos = {...(node.at(0) as ParseTreeTokenNode).pos};
                return new Nodes.DomainNode(node.splice(2,1)[0] as ExpressionNode,pos) as StrayTree<Nodes.DomainNode>;
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
            return new Nodes.StatementGroup(node.splice(1,node.length-2) as Nodes.StatementNode[]) as StrayTree<Nodes.StatementGroup>;
        },
        SOLOSTMT(node) {
            return new Nodes.StatementGroup(node.splice(0,1) as Nodes.StatementNode[]) as StrayTree<Nodes.StatementGroup>;
        },

        // Assignment and declaration
        ASSIGN(node) {
            return new Nodes.AssignmentStatement((node.at(0) as ParseTreeTokenNode).value, node.splice(-1,1)[0] as ExpressionNode) as StrayTree<Nodes.AssignmentStatement>;
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new Nodes.DeclareStatement(
                node.splice(0,1)[0] as Nodes.TypeNode,
                node.splice(0,node.length).map(x => x instanceof Nodes.AssignmentStatement ? [x.id, x.value] : [(x as ParseTreeTokenNode).value])
            ) as StrayTree<Nodes.DeclareStatement>;
        },
        DECLIDS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true);
        },

        // Control Statements
        WHILE(node) {
            return new Nodes.WhileStatement(node.splice(2,1)[0] as ExpressionNode,node.splice(-1,1)[0] as StatementGroup) as StrayTree<Nodes.WhileStatement>;
        },
        DOWHILE(node) {
            return new Nodes.DoWhileStatement(node.splice(1,1)[0] as StatementGroup, node.splice(-3,1)[0] as ExpressionNode) as StrayTree<Nodes.WhileStatement>;
        },
        IF(node) {
            return new Nodes.IfStatement(
                node.splice(2,1)[0] as ExpressionNode,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },
        IFELSE(node) {
            return new Nodes.IfStatement(
                node.splice(2,1)[0] as ExpressionNode,
                node.splice(-3,1)[0] as StatementGroup,
                node.splice(-1,1)[0] as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },

        // Special Statements
        EMIT(node) {
            switch(node.length) {
                case 2:
                    return new Nodes.EmitStatement({
                        type: (node.at(-1) as ParseTreeTokenNode).value as 'symbtable'
                    }) as StrayTree<Nodes.EmitStatement>;
                case 4:
                    return new Nodes.EmitStatement({
                        type: 'value',
                        value: node.splice(2,1)[0] as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
                case 6:
                    return new Nodes.EmitStatement({
                        type: 'string',
                        id: (node.at(1) as ParseTreeTokenNode).value,
                        index: node.splice(3,1)[0] as ExpressionNode,
                        length: node.splice(-1,1)[0] as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
            }
        },
        RAND(node) {
            switch(node.length) {
                case 2:
                    return new Nodes.RandStatement((node.at(1) as ParseTreeTokenNode).value) as StrayTree<Nodes.RandStatement>;
                case 6:
                    return new Nodes.RandStatement(
                        (node.at(1) as ParseTreeTokenNode).value,
                        node.splice(3,1)[0] as ExpressionNode,
                        node.splice(-1,1)[0] as ExpressionNode
                    ) as StrayTree<Nodes.RandStatement>;
            }
        }
    });

    export const tt = new Parsing.TokenTransformer<Nodes.LiteralNode<any>>({
        floatval(node) {
            return new Nodes.FloatLiteral(+node.value);
        },
        intval(node) {
            return new Nodes.IntLiteral(+node.value);
        },
        stringval(node) {
            return new Nodes.StringLiteral(node.value);
        }
    });
    
    console.debug('Building Parser...');
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, ZLang.tt, 'zlang.json.lz');
    console.debug('Done!');

    export function parse(tokens: Iterable<Token>): Program {
        return PARSER.parse(tokens) as Program;
    }

    export function visit(program: Program, f: (node:Nodes.ZNode|Parsing.ParseTreeTokenNode)=>void, order: 'post');
    export function visit(program: Program, f: (node:Nodes.ZNode|Parsing.ParseTreeTokenNode)=>void|boolean, order?: 'pre');
    export function visit(program: Program, f: (node:Nodes.ZNode|Parsing.ParseTreeTokenNode)=>void|boolean, order: 'pre'|'post' = 'pre') {
        const V = new Set<Nodes.ZNode|Parsing.ParseTreeTokenNode>;
        function visit(ast: Nodes.ZNode | Parsing.ParseTreeTokenNode) {
            if(V.has(ast)) return;
            V.add(ast);

            let condition = true;

            if(order === 'pre') {
                condition = f(ast) as undefined | boolean ?? condition;
            }

            if(condition && ast instanceof Nodes.ZNode) {
                for(const child of ast.children) {
                    visit(child);
                }
            }

            if(order === 'post') {
                f(ast);
            }
        }
        visit(program);
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

const ast = ZLang.parse(tokens);

function output(...args: (string|number)[]) {
    const text = ['OUTPUT'];
    for(const arg of args) {
        switch(typeof arg) {
            case 'number': {
                text.push(arg.toString());
                break;
            }
            case 'string': {
                text.push(`:${arg}:`);
                break;
            }
        }
    }
    text.push(' ');
    console.log(text.join(' '));
}

ZLang.visit(ast, function(node) {
    if(node instanceof ZLang.Nodes.DomainNode) {
        output('DOMAIN',node.pos.line,node.pos.col,node.domain);
    }
},'post')

dump('zlang', ast);
///#endif