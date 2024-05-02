#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <signature.ts>
///#include <encoding.ts>

///#include "slr1.ts"
///#include "cfg.ts"


namespace ZLang {
    type Domain = 'string' | 'bool' | 'int' | 'float';

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
            public abstract get domain(): Domain;
        }
        export abstract class LiteralNode<T> extends ExpressionNode {
            constructor(public readonly type: Domain, public readonly value: T) {super()};
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
        export class IdentifierNode extends ExpressionNode {
            constructor(public override readonly name: string) {super()}
            get domain() {
                return 'any'
            }
            get children() {
                return [];
            }
            get [Graphviz.label]() {
                return `id:${this.name}`;
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
                return (() => {
                    switch(this.name) {
                        case '-':
                        case '+':
                        
                        case '*':
                        case '/':
                        case '%':
                            return [this.lhs.domain,this.rhs.domain].includes('float') ? 'float' : this.lhs.domain;

                        case '<':
                        case '<=':
                        case '==':
                        case '>=':
                        case '>':
                            return 'bool';
                        
                        case '!=': // unused
                        default:
                            throw new Error(`Unknown binary operator '${this.name}'`);
                    }
                })();
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
                return this.val.domain; // +-~! all leave the type as is
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
                return this.type.domain;
            }
            get [Graphviz.label]() {
                return this.type[Graphviz.label];
            }
            get [Graphviz.children]() {
                return [['',this.val]];
            }
        }

        export class ParameterNode extends ZNode {
            constructor(public type: TypeNode, public readonly ident: IdentifierNode) {
                super();
            }
            get children() {
                return [this.type];
            }
            get [Graphviz.label]() {
                return `${this.type[Graphviz.label]} ${this.ident.name}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionHeaderNode extends ZNode {
            constructor(public readonly ident: IdentifierNode, public readonly rtype: TypeNode, public readonly parameters: ParameterNode[]) {
                super();
            }
            get children() {
                return [this.rtype,...this.parameters,this];
            }
            get [Graphviz.label]() {
                return `fn ${this.ident.name}(...)`;
            }
        }

        type TypeMeta = {const:boolean};
        export class TypeNode extends ZNode {
            constructor(public readonly type: Domain, public readonly meta: TypeMeta) {
                super();
            }
            get children() {
                return [];
            }
            get domain() {
                return this.type;
            }
            get [Graphviz.label]() {
                return `${this.meta.const ? 'const ' : ''}${this.type}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionCallNode extends ExpressionNode {
            constructor(public readonly ident: IdentifierNode, public readonly args: ExpressionNode[]) {
                super();
            }
            get children() {
                return [...this.args];
            }
            get domain() {
                ///#warning get function domain
                return 'any';
            }
            get [Graphviz.label]() {
                return `${this.ident.name}(...)`;
            }
        }

        export class FunctionNode extends ZNode {
            constructor(public readonly header: FunctionHeaderNode, public readonly rvar: IdentifierNode, public readonly rvalue: ExpressionNode, public readonly body: StatementGroup) {
                super();
            }
            get children() {
                return [this.header,this.rvalue,this.body];
            }
            get [Graphviz.label]() {
                return `${this.header[Graphviz.label]} {...}`;
            }
            get [Graphviz.children]() {
                return [['header',this.header],['var',this.rvar],['rvalue',this.rvalue], ['body',this.body]];
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
            constructor(public readonly value: ExpressionNode, public readonly pos: Position) {
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
            constructor(public readonly type: TypeNode, public readonly entries: [IdentifierNode, ExpressionNode?][]) {
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
                    return entry.length === 1 ? ['',entry[0]] : ['',{
                        get [Graphviz.label]() {
                            return '=';
                        },
                        get [Graphviz.children]() {
                            return [['',entry[0]], ['',entry[1]]];
                        }
                    }];
                })];
            }
        }

        export  class AssignmentStatement extends StatementNode {
            constructor(public readonly ident: IdentifierNode, public readonly value: ExpressionNode | AssignmentStatement) {
                super();
            }
            get children() {
                return [this.value];
            }
            get [Graphviz.label]() {
                return '=';
            }
            get [Graphviz.children]() {
                return [['id',this.ident],...Object.entries({value:this.value})];
            }
            get domain() {
                return this.value.domain;
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
            readonly ident: IdentifierNode,
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
                return [...(this.data.type==='string' ? [['id',this.data.ident]] : []),...Object.entries(this.data)];
            }
        }

        export class RandStatement extends StatementNode {
            constructor(public readonly ident: IdentifierNode, public readonly min?: ExpressionNode, public readonly max?: ExpressionNode) {
                super();
            }
            get children() {
                return [...(this.min !== undefined ? [this.min] : []), ...(this.max !== undefined ? [this.max] : [])];
            }
            get [Graphviz.label]() {
                return 'Rand';
            }
            get [Graphviz.children]() {
                return [['id',this.ident],...[this.min !== undefined ? ['min',this.min] : []],...[this.max !== undefined ? ['max',this.max] : []]]
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
            const [type,ident,_lraren,...parameters] = node.splice(0,node.length);
            const _rparen = parameters.pop();
            return new Nodes.FunctionHeaderNode(ident as Nodes.IdentifierNode, type as Nodes.TypeNode, parameters as Nodes.ParameterNode[]) as StrayTree<Nodes.FunctionHeaderNode>
        },
        PARAMLIST(node) {
            if(node.length === 1) return;
            if(node.length === 2) {
                const [type, ident] = node.splice(0,node.length);
                return new Nodes.ParameterNode(type as Nodes.TypeNode, ident as Nodes.IdentifierNode) as StrayTree<Nodes.ParameterNode>;
            } else {
                const [type, ident,...rest] = node.splice(0,node.length);
                return [new Nodes.ParameterNode(type as Nodes.TypeNode, ident as Nodes.IdentifierNode), ...rest] as StrayTree<Nodes.ParameterNode>[];
            }
        },
        FUNCALL(node) {
            const [ident,_lparen,...args] = node.splice(0,node.length);
            const _rparen = args.pop();
            return new Nodes.FunctionCallNode(ident as Nodes.IdentifierNode, args as ExpressionNode[]) as StrayTree<Nodes.FunctionCallNode>;
        },
        ARGLIST(node) {
            if(node.length === 1) return;
            node.splice(-2,1);
            return node.splice(0,node.length);
        },
        FUNCTION(node) {
            const [header,_returns,ident,_assign,expr,body] = node.splice(0,node.length);
            return new Nodes.FunctionNode(
                header as Nodes.FunctionHeaderNode,
                ident as Nodes.IdentifierNode,
                expr as ExpressionNode,
                body as StatementGroup
            ) as StrayTree<Nodes.FunctionNode>;
        },
        
        // Types
        'OTHERTYPE|FUNTYPE'(node) {
            return new Nodes.TypeNode((node.at(-1) as ParseTreeTokenNode).value as Domain, {const: node.length > 1 && (node.at(0) as ParseTreeTokenNode).value === 'const'}) as StrayTree<Nodes.TypeNode>;
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
            const [ident,_assign,value] = node.splice(0,node.length);
            ///#warning nested assignment
            return new Nodes.AssignmentStatement(ident as Nodes.IdentifierNode, value as ExpressionNode | Nodes.AssignmentStatement) as StrayTree<Nodes.AssignmentStatement>;
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new Nodes.DeclareStatement(
                node.splice(0,1)[0] as Nodes.TypeNode,
                node.splice(0,node.length).map(x => x instanceof Nodes.AssignmentStatement ? [x.ident, x.value] : [x as Nodes.IdentifierNode])
            ) as StrayTree<Nodes.DeclareStatement>;
        },
        DECLIDS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true);
        },

        // Control Statements
        WHILE(node) {
            const [_while,_lparen,predicate,_rparen,body] = node.splice(0,node.length);
            return new Nodes.WhileStatement(predicate as ExpressionNode,body as StatementGroup) as StrayTree<Nodes.WhileStatement>;
        },
        DOWHILE(node) {
            const [_do,body,_while,_lparen,predicate,_rparen,_sc] = node.splice(0,node.length);
            return new Nodes.DoWhileStatement(body as StatementGroup, predicate as ExpressionNode) as StrayTree<Nodes.WhileStatement>;
        },
        IF(node) {
            const [_if,_rparen,predicate,_lparen,btrue] = node.splice(0,node.length);
            return new Nodes.IfStatement(
                predicate as ExpressionNode,
                btrue as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },
        IFELSE(node) {
            const [_if,_lparen,predicate,_rparen,btrue,_else,bfalse] = node.splice(0,node.length);
            return new Nodes.IfStatement(
                predicate as ExpressionNode,
                btrue as StatementGroup,
                bfalse as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },

        // Special Statements
        EMIT(node) {
            switch(node.length) {
                case 2:
                    return new Nodes.EmitStatement({
                        type: 'symbtable'
                    }) as StrayTree<Nodes.EmitStatement>;
                case 4:
                    return new Nodes.EmitStatement({
                        type: 'value',
                        value: node.splice(2,1)[0] as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
                case 6:
                    const [_emit,ident,_comma,index,__comma,length] = node.splice(0,node.length);
                    return new Nodes.EmitStatement({
                        type: 'string',
                        ident: ident as Nodes.IdentifierNode,
                        index: index as ExpressionNode,
                        length: length as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
            }
        },
        RAND(node) {
            switch(node.length) {
                case 2:
                    const [_rand,ident] = node.splice(0,node.length);
                    return new Nodes.RandStatement(ident as Nodes.IdentifierNode) as StrayTree<Nodes.RandStatement>;
                case 6:
                    const [__rand,intIdent,_comma,min,__comma,max] = node.splice(0,node.length);
                    return new Nodes.RandStatement(intIdent as Nodes.IdentifierNode,min as ExpressionNode,max as ExpressionNode) as StrayTree<Nodes.RandStatement>;
            }
        }
    });

    export const tt = new Parsing.TokenTransformer<Nodes.LiteralNode<any> | Nodes.IdentifierNode>({
        floatval(node) {
            return new Nodes.FloatLiteral(+node.value);
        },
        intval(node) {
            return new Nodes.IntLiteral(+node.value);
        },
        stringval(node) {
            return new Nodes.StringLiteral(node.value);
        },
        id(node) {
            return new Nodes.IdentifierNode(node.value);
        }
    });
    
    console.debug('Building Parser...');
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, ZLang.tt, 'zlang.json.lz');
    console.debug('Done!');

    export function parseTokens(tokens: Iterable<Token>): Program {
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

    // Symtable pass
    export class ZType {
        public readonly const: boolean;
        public constructor(public readonly domain: Domain, pconst: boolean = false) {
            this.const = pconst;
        }
        public toString() {
            return this.const ? `const ${this.domain}` : this.domain;
        }
    }

    export class ZFunctionType {
        public readonly const = true;
        public constructor(public readonly rType: ZType, public readonly pTypes: ZType[] = []) {}
        public toString() {
            return `const ${this.rType}//${this.pTypes.join('/')}`;
        }
    }

    type Declaration = {name: string, type: ZType | ZFunctionType} & DeclarationDetails
    type DeclarationDetails = {used:boolean, initialized:boolean};
    export class Scope {
        public readonly data = new Map<string,Declaration>;
        public readonly n: number;
        public constructor(public readonly parent?: Scope) {
            this.n = this.parent ? this.parent.n + 1 : 0;
        }
        public declare(name: string, type: ZType | ZFunctionType) {
            if(this.has(name)) throw new Parsing.SemanticError(`Cannot redeclare '${name}'`);
            this.data.set(name, {name,type,used:false,initialized:false});
        }
        public has(name: string): boolean {
            return this.data.has(name);
        }
        public get(name: string): Declaration | null {
            return this.data.has(name) ? {...this.data.get(name)} : this.parent ? this.parent.get(name) : null;
        }
        public mark(name: string, dtls: Partial<DeclarationDetails>) {
            if(this.has(name)) {
                this.data.set(name,Object.assign(this.data.get(name), dtls));
            } else if(this.parent) {
                this.parent.mark(name,dtls);
            }
        }
        public toString() {
            return (this.parent ? this.parent.toString() + '\n' : '') + this.data.values().map(d => [this.n,d.type,d.name].join(',')).toArray().join('\n');
        }
        // TODO, helper to get declarations up until <name>, might require having a sperate define to update order?
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

const ast = ZLang.parseTokens(tokens);

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


// todo build and emit symtable
// todo catch syntax errors and pos
// todo semantic checks

ZLang.visit(ast, function(node) {
    if(node instanceof ZLang.Nodes.DomainNode) {
        output('DOMAIN',node.pos.line,node.pos.col,node.domain);
    }
    // if(node instanceof Parsing.ParseTreeTokenNode) {
    //     console.log(node)
    // }
},'post');

dump('zlang', ast);
///#endif