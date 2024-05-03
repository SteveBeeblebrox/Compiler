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
            constructor(public readonly pos: Position, children: ZNode[] = []) {
                super();
                this[Tree.push](...children);
            }

            public readonly name = this.constructor.name;
            get [Graphviz.label]() {
                return this.name;
            }
            public get children(): SubTree<ZNode>[] {
                return [...super[Tree.iterator]()] as SubTree<ZNode>[];
            }
            destroy() {
                return this[Tree.splice](0,this[Tree.treeLength]);
            }
        }
        export interface ZNode {
            get parent() : ZNode;

        }
        export abstract class ExpressionNode extends ZNode {
            public abstract get domain(): Domain;
        }
        export abstract class LiteralNode<T> extends ExpressionNode {
            constructor(pos: Position, public readonly type: Domain, public readonly value: T) {super(pos)};
            get domain() {
                return this.type;
            }
        }
        export class IntLiteral extends LiteralNode<number> {
            constructor(pos: Position,value: number) {
                super(pos,'int',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
        }
        export class FloatLiteral extends LiteralNode<number> {
            constructor(pos: Position,value: number) {
                super(pos,'float',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
        }
        export class StringLiteral extends LiteralNode<string> {
            constructor(pos: Position,value: string) {
                super(pos,'string',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${escapeString(this.value)}`;
            }
        }
        export class IdentifierNode extends ExpressionNode {
            constructor(pos: Position,public override readonly name: string) {super(pos)}
            get domain() {
                return ZLang.getEnclosingScope(this).get(this.name).type.domain;
            }
            get [Graphviz.label]() {
                return `id:${this.name}`;
            }
        }
        export class BinaryOp extends ExpressionNode {
            constructor(pos: Position,public override readonly name: string,public readonly lhs:ExpressionNode, public readonly rhs:ExpressionNode) {
                super(pos,[lhs,rhs]);
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
            constructor(pos: Position,public override readonly name: string,public readonly val:ExpressionNode) {
                super(pos,[val]);
            }
            get domain() {
                return this.val.domain; // +-~! all leave the type as is
            }
        }
        export class CastNode extends ExpressionNode {
            constructor(pos: Position,public type: TypeNode, public readonly val: ExpressionNode) {
                super(pos,[type,val]);
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
            constructor(pos: Position, public type: TypeNode, public readonly ident: IdentifierNode) {
                super(pos, [type,ident]);
            }
            get [Graphviz.label]() {
                return `${this.type[Graphviz.label]} ${this.ident.name}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }

        export class FunctionHeaderNode extends ZNode {
            public override readonly name: string;
            constructor(pos: Position, public readonly ident: IdentifierNode, public readonly rtype: TypeNode, public readonly parameters: ParameterNode[]) {
                super(pos,[rtype,ident,...parameters]);
                this.name = this.ident.name;
            }
            get [Graphviz.label]() {
                return `fn ${this.ident.name}(...)`;
            }
        }

        type TypeNodeMetaData = {const:boolean};
        export class TypeNode extends ZNode {
            constructor(pos: Position, public readonly type: Domain, public readonly meta: TypeNodeMetaData = {const: false}) {
                super(pos);
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
            public get ztype() {
                return new ZType(this.type,this.meta.const);
            }
        }

        export class FunctionCallNode extends ExpressionNode {
            constructor(pos: Position, public readonly ident: IdentifierNode, public readonly args: ExpressionNode[]) {
                super(pos,[ident,...args]);
            }
            get domain() {
                return ZLang.getEnclosingScope(this).get(this.ident.name).type.domain;
            }
            get [Graphviz.label]() {
                return `${this.ident.name}(...)`;
            }
        }

        export class FunctionNode extends ZNode {
            public readonly scope = new Scope();
            constructor(pos: Position, public readonly header: FunctionHeaderNode, public readonly rvar: IdentifierNode, public readonly rvalue: ExpressionNode, public readonly body: StatementGroup) {
                super(pos,[header,rvar,rvalue,body]);
            }
            get [Graphviz.label]() {
                return `${this.header[Graphviz.label]} {...}`;
            }
            get [Graphviz.children]() {
                return [['header',this.header],['var',this.rvar],['rvalue',this.rvalue], ['body',this.body]];
            }
        }

        export class Program extends ZNode {
            public readonly scope = new Scope();
            constructor(pos: Position, public readonly steps: (StatementNode|FunctionNode)[]) {
                super(pos,[...steps]);
            }
            get [Graphviz.label]() {
                return 'Program.z';
            }
            get [Graphviz.children]() {
                return this.children.map((n,i) => [`statements[${i}]`,n]);
            }
        }

        export class DomainNode extends ExpressionNode {
            constructor(pos: Position, public readonly value: ExpressionNode) {
                super(pos,[value]);
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
            get [Graphviz.label]() {
                return 'Statement';
            }
        }

        export class DeclareStatement extends StatementNode {
            constructor(pos: Position,public readonly type: TypeNode, public readonly entries: [IdentifierNode, ExpressionNode?][]) {
                super(pos,[type,...entries.flat()]);
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
            constructor(pos: Position,public readonly ident: IdentifierNode, public readonly value: ExpressionNode | AssignmentStatement) {
                super(pos,[ident,value]);
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
            constructor(pos: Position,public readonly predicate: ExpressionNode, public readonly btrue: StatementGroup, public readonly bfalse?: StatementGroup) {
                super(pos,[predicate,btrue,...(bfalse !== undefined ? [bfalse] : [])]);
            }
            get [Graphviz.label]() {
                return this.bfalse !== undefined ? 'If-Else' : 'If'
            }
        }

        export class DoWhileStatement extends StatementNode {
            constructor(pos: Position,public readonly body: StatementGroup, public readonly predicate: ExpressionNode) {
                super(pos,[body,predicate]);
            }
            get [Graphviz.label]() {
                return 'Do While';
            }
        }

        export  class WhileStatement extends StatementNode {
            constructor(pos: Position,public readonly predicate: ExpressionNode, public readonly body: StatementGroup) {
                super(pos,[predicate,body]);
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
            constructor(pos: Position,public readonly data: EmitMeta) {
                super(pos,(function() {
                    switch(data.type) {
                        case 'value': return [data.value];
                        case 'string': return [data.index,data.length];
                        default: return [];
                    }
                })());
            }
            get [Graphviz.label]() {
                return 'Emit'
            }
            get [Graphviz.children]() {
                return [...(this.data.type==='string' ? [['id',this.data.ident]] : []),...Object.entries(this.data)];
            }
        }

        export class RandStatement extends StatementNode {
            constructor(pos: Position,public readonly ident: IdentifierNode, public readonly min?: ExpressionNode, public readonly max?: ExpressionNode) {
                super(pos,[...(min !== undefined ? [min] : []), ...(max !== undefined ? [max] : [])]);
            }
            get [Graphviz.label]() {
                return 'Rand';
            }
            get [Graphviz.children]() {
                return [['id',this.ident],...[this.min !== undefined ? ['min',this.min] : []],...[this.max !== undefined ? ['max',this.max] : []]]
            }
        }

        export class StatementGroup extends StatementNode {
            public readonly scope = new Scope();
            constructor(pos: Position,public readonly statements: StatementNode[]) {
                super(pos,[...statements]);
            }
            get [Graphviz.label]() {
                return 'Statements';
            }
            get[Graphviz.exclude]() {
                return ['scope'];
            }
        }
    }

    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    import ExpressionNode = Nodes.ExpressionNode;
    import StatementGroup = Nodes.StatementGroup;
    import ZNode = Nodes.ZNode;
    export import Program = Nodes.Program;

    export const sdt = new Parsing.SyntaxTransformer<Nodes.ZNode>({
        '*'(node: Parsing.ParseTreeNode) {
            if(node.length === 1) {
                if(node.at(0) instanceof Parsing.ParseTreeLambdaNode) {
                    // Remove empty lambdas
                    return null;
                } else {
                    // Squish tree
                    return node.pop() as StrayTree<ZNode>;
                }
            } else if(node.name.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length) as StrayTree<ZNode>[];
            }
        },

        // Expressions
        'SUM|PRODUCT|BEXPR'(node) {
            if(node.length === 1) return;
            return new Nodes.BinaryOp(node.pos,(node.at(1) as ParseTreeTokenNode).value,node.shift() as ExpressionNode,node.pop() as ExpressionNode) as StrayTree<Nodes.BinaryOp>;
        },
        UNARY(node) {
            if(node.length === 1) return;
            return new Nodes.UnaryOp(node.pos,(node.at(0) as ParseTreeTokenNode).value,node.pop() as ExpressionNode) as StrayTree<Nodes.UnaryOp>;
        },
        CAST(node) {
            return new Nodes.CastNode(node.pos,
                new Nodes.TypeNode((node.at(0) as Parsing.ParseTreeTokenNode).pos,(node.at(0) as ParseTreeTokenNode).value as Domain),
                node.splice(2,1)[0] as ExpressionNode
            ) as StrayTree<Nodes.CastNode>;
        },

        // Functions
        FUNSIG(node) {
            const [type,ident,_lraren,...parameters] = node.splice(0,node.length);
            const _rparen = parameters.pop();
            return new Nodes.FunctionHeaderNode((ident as Nodes.TypeNode).pos,ident as Nodes.IdentifierNode, type as Nodes.TypeNode, parameters as Nodes.ParameterNode[]) as StrayTree<Nodes.FunctionHeaderNode>
        },
        PARAMLIST(node) {
            if(node.length === 1) return;
            if(node.length === 2) {
                const [type, ident] = node.splice(0,node.length);
                // (type as Nodes.TypeNode).meta.const = true;
                return new Nodes.ParameterNode(node.pos,type as Nodes.TypeNode, ident as Nodes.IdentifierNode) as StrayTree<Nodes.ParameterNode>;
            } else {
                const [type, ident, _comma,...rest] = node.splice(0,node.length);
                // (type as Nodes.TypeNode).meta.const = true;
                return [new Nodes.ParameterNode(node.pos,type as Nodes.TypeNode, ident as Nodes.IdentifierNode), ...rest] as StrayTree<Nodes.ParameterNode>[];
            }
        },
        FUNCALL(node) {
            const [ident,_lparen,...args] = node.splice(0,node.length);
            const _rparen = args.pop();
            return new Nodes.FunctionCallNode(node.pos,ident as Nodes.IdentifierNode, args as ExpressionNode[]) as StrayTree<Nodes.FunctionCallNode>;
        },
        ARGLIST(node) {
            if(node.length === 1) return;
            node.splice(-2,1);
            return node.splice(0,node.length) as StrayTree<ZNode>[];
        },
        FUNCTION(node) {
            const [header,_returns,ident,_assign,expr,body] = node.splice(0,node.length);
            return new Nodes.FunctionNode(
                (ident as Nodes.IdentifierNode).pos,
                header as Nodes.FunctionHeaderNode,
                ident as Nodes.IdentifierNode,
                expr as ExpressionNode,
                body as StatementGroup
            ) as StrayTree<Nodes.FunctionNode>;
        },
        
        // Types
        'OTHERTYPE|FUNTYPE'(node) {
            return new Nodes.TypeNode(node.pos,(node.at(-1) as ParseTreeTokenNode).value as Domain, {const: node.length > 1 && (node.at(0) as ParseTreeTokenNode).value === 'const' || (node.at(-1) as ParseTreeTokenNode).value === 'string'}) as StrayTree<Nodes.TypeNode>;
        },
        
        // General simplification
        MODULE(node) {
            return new Nodes.Program(node.pos,node.splice(0,node.length - 1) as (Nodes.StatementNode | Nodes.FunctionNode)[]) as StrayTree<Nodes.Program>;
        },
        MODPARTS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'sc' : true)  as StrayTree<ZNode>[];
        },
        VALUE(node) {
            if(node.length === 3) {
                return node.splice(1,1) as StrayTree<ZNode>[];
            } else if(node.length === 4) {
                const pos = {...(node.at(0) as ParseTreeTokenNode).pos};
                return new Nodes.DomainNode(node.pos,node.splice(2,1)[0] as ExpressionNode) as StrayTree<Nodes.DomainNode>;
            }
        },
        BSTMT(node) {
            return node.splice(0,1) as StrayTree<ZNode>[];
        },
        BSTMTS(node) {
            if(node.length === 1) return;
            return node.splice(0,node.length) as StrayTree<ZNode>[];
        },
        BRACESTMTS(node) {
            return new Nodes.StatementGroup(node.pos,node.splice(1,node.length-2) as Nodes.StatementNode[]) as StrayTree<Nodes.StatementGroup>;
        },
        SOLOSTMT(node) {
            return new Nodes.StatementGroup(node.pos,node.splice(0,1) as Nodes.StatementNode[]) as StrayTree<Nodes.StatementGroup>;
        },

        // Assignment and declaration
        ASSIGN(node) {
            const [ident,_assign,value] = node.splice(0,node.length);
            return new Nodes.AssignmentStatement(node.pos,ident as Nodes.IdentifierNode, value as ExpressionNode | Nodes.AssignmentStatement) as StrayTree<Nodes.AssignmentStatement>;
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new Nodes.DeclareStatement(
                node.pos,
                node.splice(0,1)[0] as Nodes.TypeNode,
                node.splice(0,node.length).map(function(tree) {
                    if(tree instanceof Nodes.AssignmentStatement) {
                        return tree.destroy() as [Nodes.IdentifierNode, ExpressionNode];
                    } else {
                        return [tree] as [Nodes.IdentifierNode];
                    }
                })
            ) as StrayTree<Nodes.DeclareStatement>;
        },
        DECLIDS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true)  as StrayTree<ZNode>[];
        },

        // Control Statements
        WHILE(node) {
            const [_while,_lparen,predicate,_rparen,body] = node.splice(0,node.length);
            return new Nodes.WhileStatement(node.pos,predicate as ExpressionNode,body as StatementGroup) as StrayTree<Nodes.WhileStatement>;
        },
        DOWHILE(node) {
            const [_do,body,_while,_lparen,predicate,_rparen,_sc] = node.splice(0,node.length);
            return new Nodes.DoWhileStatement(node.pos,body as StatementGroup, predicate as ExpressionNode) as StrayTree<Nodes.WhileStatement>;
        },
        IF(node) {
            const [_if,_rparen,predicate,_lparen,btrue] = node.splice(0,node.length);
            return new Nodes.IfStatement(
                node.pos,
                predicate as ExpressionNode,
                btrue as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },
        IFELSE(node) {
            const [_if,_lparen,predicate,_rparen,btrue,_else,bfalse] = node.splice(0,node.length);
            return new Nodes.IfStatement(
                node.pos,
                predicate as ExpressionNode,
                btrue as StatementGroup,
                bfalse as StatementGroup
            ) as StrayTree<Nodes.IfStatement>;
        },

        // Special Statements
        EMIT(node) {
            switch(node.length) {
                case 2:
                    return new Nodes.EmitStatement(node.pos,{
                        type: 'symbtable'
                    }) as StrayTree<Nodes.EmitStatement>;
                case 4:
                    return new Nodes.EmitStatement(node.pos,{
                        type: 'value',
                        value: node.splice(2,1)[0] as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
                case 6:
                    const [_emit,ident,_comma,index,__comma,length] = node.splice(0,node.length);
                    return new Nodes.EmitStatement(node.pos,{
                        type: 'string',
                        ident: ident as Nodes.IdentifierNode,
                        index: index as ExpressionNode,
                        length: length as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
            }
        },
        RAND(node) {
            switch(node.length) {
                case 2: {
                    const [_rand,ident] = node.splice(0,node.length);
                    return new Nodes.RandStatement(node.pos,ident as Nodes.IdentifierNode) as StrayTree<Nodes.RandStatement>;
                }
                case 6: {
                    const [_rand,intIdent,_comma,min,__comma,max] = node.splice(0,node.length);
                    return new Nodes.RandStatement(node.pos,intIdent as Nodes.IdentifierNode,min as ExpressionNode,max as ExpressionNode) as StrayTree<Nodes.RandStatement>;
                }
            }
        }
    });

    export const tt = new Parsing.TokenTransformer<Nodes.LiteralNode<any> | Nodes.IdentifierNode>({
        floatval(node) {
            return new Nodes.FloatLiteral(node.pos,+node.value);
        },
        intval(node) {
            return new Nodes.IntLiteral(node.pos,+node.value);
        },
        stringval(node) {
            return new Nodes.StringLiteral(node.pos,node.value);
        },
        id(node) {
            return new Nodes.IdentifierNode(node.pos,node.value);
        }
    });
    
    console.debug('Building Parser...');
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, ZLang.tt, 'zlang.json.lz');
    console.debug('Done!');

    export function parseTokens(tokens: Iterable<Token>): Program {
        return PARSER.parse(tokens) as Program;
    }

    // For preorder traversal, returning false prevents visiting children
    export function visit(program: Program, f: (node:Nodes.ZNode)=>void, order: 'post');
    export function visit(program: Program, f: (node:Nodes.ZNode, V: Set<Nodes.ZNode>)=>void|boolean, order?: 'pre');
    export function visit(program: Program, f: (node:Nodes.ZNode, V: Set<Nodes.ZNode>)=>void|boolean, order: 'pre'|'post' = 'pre') {
        const V = new Set<Nodes.ZNode>;
        function visit(node: Nodes.ZNode) {
            if(V.has(node)) return;
            V.add(node);

            let condition = true;

            if(order === 'pre') {
                condition = f(node,V) as undefined | boolean ?? condition;
            }

            if(condition && node instanceof Nodes.ZNode) {
                for(const child of node.children) {
                    visit(child);
                }
            }

            if(order === 'post') {
                f.bind(node)(node);
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
        public get domain() {
            return this.rType.domain;
        }
    }

    export const enum SemanticErrorType {
        // TODO, error codes
    }

    type Declaration = {n: number, name: string, type: ZType | ZFunctionType, pos: Position} & DeclarationDetails
    type DeclarationDetails = {used:boolean, initialized:boolean};
    export class Scope {
        private readonly data = new Map<string,Declaration>;
        public constructor(public parent?: Scope) {}
        protected get n() {
            return this.parent ? this.parent.n + 1 : 0;
        }
        public declare(name: string, type: ZType | ZFunctionType, pos: Position, dtls?: Partial<DeclarationDetails>) {
            if(this.has(name)) throw new Parsing.SemanticError(`Cannot redeclare '${name}'`);
            this.data.set(name, {n: this.n,name,type,pos,used:false,initialized:false,...(dtls??{})});
        }

        ///#warning Scope#get and Scope#has should respect position
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

        public entries(): [string,Declaration][] {
            return [
                ...(this.parent ? this.parent.entries() : []),
                ...this.data.entries()
            ];
        }

        public dir(pos?: Position): Declaration[] {
            const data = new Map();
            for(const [k,v] of this.entries()) {
                if(pos === undefined || Position.offset(pos,v.pos) <= 0) {
                    if(data.has(k)) {
                        data.delete(k);
                    }
                    data.set(k,v);
                }
            }

            return [...data.values()];
        }
    }

    export function getEnclosingScope(node: ZNode): Scope | null {
        let p: ZNode = node;
        while(p=p.parent) {
            if(p instanceof StatementGroup || p instanceof Nodes.FunctionNode || p instanceof Program) {
                return p.scope;
            }
        }
        return null;
    }

    export function initSymbols(program: Program) {
        ZLang.visit(program,function(node,V: Set<Nodes.ZNode>) {
            // Set up scopes
            if((node instanceof StatementGroup || node instanceof Nodes.FunctionNode) && !node.scope.parent) {
                const scope = getEnclosingScope(node);
                if(scope) {
                    node.scope.parent = scope;
                }
            }

            function declareFunction(header: Nodes.FunctionHeaderNode) {
                getEnclosingScope(node).declare(header.name, new ZFunctionType(
                    header.rtype.ztype,
                    header.parameters.map(p=>p.type.ztype)
                ),header.pos);
            }

            if(node instanceof Nodes.FunctionHeaderNode) {
                declareFunction(node);
            } else if(node instanceof Nodes.FunctionNode) {
                const scope = getEnclosingScope(node);
                if(!scope.has(node.header.ident.name)) {
                    declareFunction(node.header);
                }
                scope.mark(node.header.ident.name,{initialized:true});
                V.add(node.header);
                V.add(node.rvar);

                for(const p of node.header.parameters) {
                    node.scope.declare(name,p.type.ztype,p.pos,{initialized: true});
                }
                node.scope.declare(node.rvar.name,node.header.rtype.ztype,node.rvar.pos,{initialized: true});

            } else if(node instanceof Nodes.DeclareStatement) {
                const scope = getEnclosingScope(node);
                for(const [ident,value] of node.entries) {
                    scope.declare(ident.name, node.type.ztype, ident.pos);
                    if(value !== undefined) {
                        scope.mark(ident.name,{initialized:true});
                    }
                    V.add(ident);
                }
            } else if(node instanceof Nodes.AssignmentStatement) {
                const scope = getEnclosingScope(node);
                scope.mark(node.ident.name,{initialized:true});
                // throw error when assigning to const
                V.add(node.ident);
            } else if(node instanceof Nodes.IdentifierNode) {
                getEnclosingScope(node).mark(node.name,{used: true});
            }
        },'pre');
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

function readTokenStream(path: string) {
    return system.readTextFileSync(path)
        .trim()
        .split('\n')
        .filter(x=>x.trim())
        .map(x=>x.trim().split(' '))
        .map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}))
    ;
}

/*
try {
    
    
} catch(e) {
    
    if(e instanceof Parsing.SyntaxError) {
        output('SYNTAX',0,0,'SYNTAX');
        system.exit(7);
    }

    else {
        console.error('IO ERROR');
        system.exit(1);
    }
}
*/


// todo catch syntax errors and pos
// todo semantic checks



const [tokenSrc,astOutput,symbtableOutput = 'program.sym'] = system.args.slice(1);
console.debug('Parsing...');

// Read tokens
const tokens = readTokenStream(tokenSrc);

// Parse
const ast = ZLang.parseTokens(tokens);

ZLang.initSymbols(ast);




// Emit Domain Statements
ZLang.visit(ast, function(node) {
    if(node instanceof ZLang.Nodes.DomainNode) {
        output('DOMAIN',node.pos.line,node.pos.col,node.domain);
    }
},'post');




// Emit Symtables
ZLang.visit(ast,function(node) {
    if(symbtableOutput && node instanceof ZLang.Nodes.EmitStatement && node.data.type === 'symbtable') {
        system.writeTextFileSync(symbtableOutput,ZLang.getEnclosingScope(node).dir(node.pos).map(d => [d.n,d.type,d.name].join(',')).join('\n'));
    }
});


console.debug('Done!');



dump('zlang', ast);
///#endif