#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>
///#include <signature.ts>
///#include <encoding.ts>

///#include "scanner.ts"
///#include "slr1.ts"
///#include "cfg.ts"
///#include "asm.ts"


namespace ZLang {
    export type Domain = 'string' | 'bool' | 'int' | 'float';

    function escapeString(text: string) {
        return JSON.stringify(text).slice(1,-1).replace(/'/g,'\\\'').replace(/\\"/g,'"');
    }
    
    const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.cfg"
    ])));
    
    type RegisterCount = [RN: number, RF: number];
    
    export namespace Nodes {
        import CompileContext = ASM.CompileContext;
        import Instruction = ASM.Instruction;
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
            get [Graphviz.exclude]() {
                return ['pos'];
            }
        }
        export interface ZNode {
            get parent() : ZNode;

        }
        export abstract class ExpressionNode extends ZNode {
            public abstract get domain(): Domain;
            public abstract get regCount(): RegisterCount;
            get [Graphviz.attributes]() {
                try {
                    return {xlabel:`${this.regCount[0]},${this.regCount[1]}`,forcelabels:true};
                } catch {
                    return {};
                }
            }
        }
        export abstract class LiteralNode<T> extends ExpressionNode {
            constructor(pos: Position, public readonly type: Domain, public readonly value: T) {super(pos)};
            get domain() {
                return this.type;
            }
            public abstract get isImmediate(): boolean;
            public abstract toASM(): string;
        }
        
        export class IntLiteral extends LiteralNode<number> {
            constructor(pos: Position,value: number) {
                super(pos,'int',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
            get regCount(): RegisterCount {
                return [this.isImmediate ? 0 : 1,0];
            }
            get isImmediate(): boolean {
                return this.value >= IntLiteral.IMM_MIN && this.value <= IntLiteral.IMM_MAX;
            }
            public override toASM(): string {
                return `#${this.value}`;
            }
        }
        export namespace IntLiteral {
            export const IMM_MIN = -16384, IMM_MAX = 16383;
        }

        export class FloatLiteral extends LiteralNode<number> {
            constructor(pos: Position,value: number) {
                super(pos,'float',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${this.value}`;
            }
            get regCount(): RegisterCount {
                return [0, this.isImmediate ? 0 : 1];
            }
            get isImmediate(): boolean {
                return this.value >= FloatLiteral.IMM_MIN && this.value <= FloatLiteral.IMM_MAX && this.decimals <= FloatLiteral.IMM_MAX_DECIMALS;
            }
            get decimals(): number {
                return this.value % 1 ? this.value.toString().split('.')[1].length : 0;
            }
            public override toASM(): string {
                return `#${this.value.toFixed(8)}`;
            }
        }
        export namespace FloatLiteral {
            export const IMM_MIN = 0, IMM_MAX = 1310.71;
            export const IMM_MAX_DECIMALS = 2;
        }

        export class StringLiteral extends LiteralNode<string> {
            constructor(pos: Position,value: string) {
                super(pos,'string',value);
            }
            get [Graphviz.label]() {
                return `${this.domain}val:${escapeString(this.value)}`;
            }
            get isImmediate(): boolean {
                return false;
            }
            get regCount(): RegisterCount {
                throw new Error('String Literals NYI');
            }
            public override toASM(): string {
                throw new Error('String Literals NYI');
                return alphaEncode(this.value);
            }
        }
        export class IdentifierNode extends ExpressionNode {
            constructor(pos: Position,public override readonly name: string) {super(pos)}
            get domain() {
                return ZLang.getEnclosingScope(this).get(this.name,this.pos).type.domain;
            }
            get [Graphviz.label]() {
                return `id:${this.name}`;
            }
            get regCount(): RegisterCount {
                return this.domain === 'float' ? [0,1] : [1,0];
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
            get regCount(): RegisterCount {
                if(
                    (this.lhs.domain === 'float' && this.rhs.domain !== 'float')
                    || (this.lhs.domain !== 'float' && this.rhs.domain === 'float')
                ) {
                    throw new Error('Mixed Expressions NYI');
                } else {
                    const [Rleft,Fleft] = this.lhs.regCount;
                    const [Rright,Fright] = this.rhs.regCount;

                    function f(left,right): number {
                        if(left === 0 && right === 0) {
                            return 0;
                        } else if(left === right) {
                            return left + 1;
                        } else {
                            return Math.max(left,right);
                        }
                    }

                    return [f(Rleft,Rright), f(Fleft,Fright)];
                }
            }
        }
        export class UnaryOp extends ExpressionNode {
            constructor(pos: Position,public override readonly name: string,public readonly val:ExpressionNode) {
                super(pos,[val]);
            }
            get domain() {
                return this.val.domain; // +-~! all leave the type as is
            }
            get regCount(): RegisterCount {
                return this.val.regCount;
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
            get regCount(): RegisterCount {
                if(
                    (this.type.domain === 'float' && this.val.domain !== 'float')
                    || (this.type.domain !== 'float' && this.val.domain === 'float')
                ) {
                    throw new Error('Mixed Expressions NYI');
                } else {
                    return this.val.regCount;
                }
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
                return ZLang.getEnclosingScope(this).get(this.ident.name, this.pos).type.domain;
            }
            get [Graphviz.label]() {
                return `${this.ident.name}(...)`;
            }
            get regCount(): RegisterCount {
                throw new Error('Function Calls NYI');
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
            compile(ctx: ASM.CompileContext): Instruction[] {
                throw new Error('Functions NYI');
            }
        }

        export class Program extends ZNode {
            public readonly scope = new Scope();
            constructor(pos: Position, public readonly statements: (StatementNode|FunctionNode|FunctionHeaderNode)[]) {
                super(pos,[...statements]);
            }
            get [Graphviz.label]() {
                return 'Program.z';
            }
            get [Graphviz.children]() {
                return this.children.map((n,i) => [`statements[${i}]`,n]);
            }
            compile(ctx: CompileContext): Instruction[] {
                const instructions: Instruction[] = [];
                instructions.push(`# Compiled at ${new Date().toISOString()}`);
                
                const literals = new Map<any,ASM.Address>();
                let byteOffset = 0;
                let n = 0;
    
                function nextAddr(alignment: ASM.Alignment): ASM.Address {
                    const bytes = ASM.ASMUtil.alignmentToBytes(alignment);
                    byteOffset += bytes - (byteOffset % bytes);
                    return `@${byteOffset/bytes}${alignment}`;
                }

                instructions.push('# Literals');
                ZLang.visit(this, function(node) {
                    if(
                        node instanceof ZLang.Nodes.LiteralNode
                        && !node.isImmediate
                        && !literals.has(node.value)
                    ) {
                        const address = nextAddr(ASM.ASMUtil.domainToAlignment(node.domain));
                        literals.set(node.value, address);
                        instructions.push(`label ${address} !${n++}`);
                        instructions.push(`data ${address} ${node.toASM()}`);
                    } 
                }, 'pre', this);

                instructions.push('');
                instructions.push('# Global Variables');
                ZLang.visit(this, function(node) {
                    if(node instanceof ZLang.Nodes.DeclareStatement) {
                        for(const [idents,value] of node.entries) {
                            for(const ident of idents) {
                                const address = nextAddr(ASM.ASMUtil.domainToAlignment(value.domain));
                                ZLang.getEnclosingScope(node).setAddress(ident.name, address);
                                instructions.push(`label ${address} ${ident.name}`);
                            }
                        }
                    }
                    return !(node instanceof ZLang.Nodes.FunctionNode);
                }, 'pre');

                instructions.push('');
                instructions.push(`init ${nextAddr('i')}`);

                instructions.push('');
                instructions.push('# Body')

                for(const statement of this.statements) {
                    if(statement instanceof FunctionNode || statement instanceof StatementNode) {
                        instructions.push(...statement.compile(ctx));
                    }
                }
                
                instructions.push('return');
                return instructions;
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
            get regCount(): RegisterCount {
                return this.value.regCount;
            }
        }

        export abstract class StatementNode extends ZNode {
            get [Graphviz.label]() {
                return 'Statement';
            }
            abstract compile(ctx: ASM.CompileContext): Instruction[];
        }

        export class DeclareStatement extends StatementNode {
            // Each x=y=z=1 is an entry of the form [[x,y,z],1]
            constructor(pos: Position,public readonly type: TypeNode, public readonly entries: [IdentifierNode[], ExpressionNode?][]) {
                super(pos,[type,...entries.map(([idents,expr])=>[...idents,...(expr?[expr]:[])]).flat()]);
            }
            get [Graphviz.label]() {
                return 'Declare';
            }
            get [Graphviz.children]() {
                return [...Object.entries({type:this.type}), ...this.entries.map(function([...entry]) {
                    let value: object = entry[1]??entry[0].pop();
                    while(entry[0].length) {
                        const ident = entry[0].pop();
                        const rhs = value;
                        value = {
                            get [Graphviz.label]() {
                                return '=';
                            },
                            get [Graphviz.children]() {
                                return [['id',ident],['value',rhs]];
                            }
                        }
                    }
                    return ['',value]
                })];
            }
            compile(ctx: CompileContext): Instruction[] {
                return ['#declare'];   
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
            compile(ctx: CompileContext): Instruction[] {
                return ['#assign'];   
            }
        }

        export  class IfStatement extends StatementNode {
            constructor(pos: Position,public readonly predicate: ExpressionNode, public readonly btrue: StatementGroup, public readonly bfalse?: StatementGroup) {
                super(pos,[predicate,btrue,...(bfalse !== undefined ? [bfalse] : [])]);
            }
            get [Graphviz.label]() {
                return this.bfalse !== undefined ? 'If-Else' : 'If'
            }
            compile(ctx: CompileContext): Instruction[] {
                throw new Error('If/Else NYI');   
            }
        }

        export class DoWhileStatement extends StatementNode {
            constructor(pos: Position,public readonly body: StatementGroup, public readonly predicate: ExpressionNode) {
                super(pos,[body,predicate]);
            }
            get [Graphviz.label]() {
                return 'Do While';
            }
            compile(ctx: CompileContext): Instruction[] {
                throw new Error('Do While Loop NYI');   
            }
        }

        export  class WhileStatement extends StatementNode {
            constructor(pos: Position,public readonly predicate: ExpressionNode, public readonly body: StatementGroup) {
                super(pos,[predicate,body]);
            }
            get [Graphviz.label]() {
                return 'While';
            }
            compile(ctx: CompileContext): Instruction[] {
                throw new Error('While Loop NYI');   
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
                        case 'string': return [data.ident,data.index,data.length];
                        default: return [];
                    }
                })());
            }
            get [Graphviz.label]() {
                return this.data.type === 'symbtable' ? 'Emit Symtable' : 'Emit';
            }
            get [Graphviz.children]() {
                return [...Object.entries(this.data)];
            }
            compile(ctx: CompileContext): Instruction[] {
                return ['#emit'];   
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
            compile(ctx: CompileContext): Instruction[] {
                return ['#rand'];   
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
                return ['scope',...super[Graphviz.exclude]];
            }
            compile(ctx: CompileContext): Instruction[] {
                return this.statements.flatMap(s => s.compile(ctx));
            }
        }
    }

    import ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    import ExpressionNode = Nodes.ExpressionNode;
    import StatementGroup = Nodes.StatementGroup;
    import ZNode = Nodes.ZNode;
    export import Program = Nodes.Program;

    const sdt = new Parsing.SyntaxTransformer<Nodes.ZNode>({
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
            return new Nodes.BinaryOp((node.at(1) as ZNode).pos,(node.at(1) as ParseTreeTokenNode).value,node.shift() as ExpressionNode,node.pop() as ExpressionNode) as StrayTree<Nodes.BinaryOp>;
        },
        UNARY(node) {
            if(node.length === 1) return;
            return new Nodes.UnaryOp((node.at(0) as ZNode).pos,(node.at(0) as ParseTreeTokenNode).value,node.pop() as ExpressionNode) as StrayTree<Nodes.UnaryOp>;
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
                const pos = {...node.pos};
                const [type, ident] = node.splice(0,node.length);
                (type as Nodes.TypeNode).meta.const = true;
                return new Nodes.ParameterNode(pos,type as Nodes.TypeNode, ident as Nodes.IdentifierNode) as StrayTree<Nodes.ParameterNode>;
            } else {
                const pos = {...node.pos};
                const [type, ident, _comma,...rest] = node.splice(0,node.length);
                (type as Nodes.TypeNode).meta.const = true;
                return [new Nodes.ParameterNode(pos,type as Nodes.TypeNode, ident as Nodes.IdentifierNode), ...rest] as StrayTree<Nodes.ParameterNode>[];
            }
        },
        FUNCALL(node) {
            const pos = {...node.pos};
            const [ident,_lparen,...args] = node.splice(0,node.length);
            const _rparen = args.pop();
            return new Nodes.FunctionCallNode(pos,ident as Nodes.IdentifierNode, args as ExpressionNode[]) as StrayTree<Nodes.FunctionCallNode>;
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
                const pos = {...node.pos};
                return new Nodes.DomainNode(pos,node.splice(2,1)[0] as ExpressionNode) as StrayTree<Nodes.DomainNode>;
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
            const pos = {...node.pos};
            const [ident,_assign,value] = node.splice(0,node.length);
            return new Nodes.AssignmentStatement(pos,ident as Nodes.IdentifierNode, value as ExpressionNode | Nodes.AssignmentStatement) as StrayTree<Nodes.AssignmentStatement>;
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new Nodes.DeclareStatement(
                node.pos,
                node.splice(0,1)[0] as Nodes.TypeNode,
                node.splice(0,node.length).map(function(tree) {
                    const idents: Nodes.IdentifierNode[] = [];
                    while(tree instanceof Nodes.AssignmentStatement) {
                        const [lhs,rhs] = tree.destroy();
                        idents.push(lhs as Nodes.IdentifierNode);
                        if(rhs instanceof Nodes.AssignmentStatement) {
                            tree = rhs;
                        } else {
                            return [idents,rhs as Nodes.ExpressionNode];
                        }
                    }
                    
                    return [[tree as Nodes.IdentifierNode]];
                })
            ) as StrayTree<Nodes.DeclareStatement>;
        },
        DECLIDS(node) {
            return node.splice(0,node.length).filter(n=>n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true)  as StrayTree<ZNode>[];
        },

        // Control Statements
        WHILE(node) {
            const pos = {...node.pos};
            const [_while,_lparen,predicate,_rparen,body] = node.splice(0,node.length);
            return new Nodes.WhileStatement(pos,predicate as ExpressionNode,body as StatementGroup) as StrayTree<Nodes.WhileStatement>;
        },
        DOWHILE(node) {
            const pos = {...node.pos};
            const [_do,body,_while,_lparen,predicate,_rparen,_sc] = node.splice(0,node.length);
            return new Nodes.DoWhileStatement(pos,body as StatementGroup, predicate as ExpressionNode) as StrayTree<Nodes.WhileStatement>;
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
            const pos = {...node.pos};
            switch(node.length) {
                case 2:
                    return new Nodes.EmitStatement(pos,{
                        type: 'symbtable'
                    }) as StrayTree<Nodes.EmitStatement>;
                case 4:
                    return new Nodes.EmitStatement(pos,{
                        type: 'value',
                        value: node.splice(2,1)[0] as ExpressionNode
                    }) as StrayTree<Nodes.EmitStatement>;
                case 6:
                    const [_emit,ident,_comma,index,__comma,length] = node.splice(0,node.length);
                    return new Nodes.EmitStatement(pos,{
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
                    const pos = {...node.pos};
                    const [_rand,ident] = node.splice(0,node.length);
                    return new Nodes.RandStatement(pos,ident as Nodes.IdentifierNode) as StrayTree<Nodes.RandStatement>;
                }
                case 6: {
                    const pos = {...node.pos};
                    const [_rand,intIdent,_comma,min,__comma,max] = node.splice(0,node.length);
                    return new Nodes.RandStatement(pos,intIdent as Nodes.IdentifierNode,min as ExpressionNode,max as ExpressionNode) as StrayTree<Nodes.RandStatement>;
                }
            }
        }
    });

    const tt = new Parsing.TokenTransformer<Nodes.LiteralNode<any> | Nodes.IdentifierNode>({
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
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, sdt, tt, 'zlang.json.lz');
    console.debug('Done!');

    export function parseTokens(tokens: Iterable<Token>): Program {
        return PARSER.parse(tokens) as Program;
    }

    // For preorder traversal, returning false prevents visiting children
    // For postorder traversal, returing false prevents visiting parents but not sibblings and parents' sibblings
    export function visit(program: Program, f: (node:Nodes.ZNode)=>void|boolean, order: 'post', thisArg?: any);
    export function visit(program: Program, f: (node:Nodes.ZNode, V: Set<Nodes.ZNode>)=>void|boolean, order?: 'pre', thisArg?: any);
    export function visit(program: Program, f: (node:Nodes.ZNode, V: Set<Nodes.ZNode>)=>void|boolean, order: 'pre'|'post' = 'pre', thisArg?: any) {
        const V = new Set<Nodes.ZNode>;
        function visit(node: Nodes.ZNode) {
            if(V.has(node)) return;
            V.add(node);

            let precondition = true;
            let postcondition = true;

            if(order === 'pre') {
                precondition = f.bind(thisArg ?? node)(node,V) as undefined | boolean ?? precondition;
            }
            
            if(precondition && node instanceof Nodes.ZNode) {
                for(const child of node.children) {
                    postcondition = (visit(child) ?? postcondition) && postcondition; // &&= short circuits, and we don't want that
                }
            }


            if(order === 'post' && postcondition) {
                postcondition = f.bind(thisArg ?? node)(node);
            }

            return postcondition;
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
        public const: boolean;
        public constructor(public readonly rType: ZType, public readonly pTypes: ZType[] = [], pconst: boolean = false) {
            this.const = pconst;
        }
        
        public toString() {
            // implicit const is omitted on parameters
            return `${this.const ? 'const ' : ''}${this.rType.domain}//${this.pTypes.map(x=>x.domain).join('/')}`;
        }
        public get domain() {
            return this.rType.domain;
        }
    }

    export enum SemanticErrors {
        UNKNOWN,
        REIDENT,
        EXPR,
        CONST,
        UNDECL
    }

    export let raise = function raise(errno: SemanticErrors, message: string, pos?: Position): void | never {
        throw new Parsing.SemanticError(`${SemanticErrors[errno]}: ${message}`, pos);
    }

    type Declaration = {n: number, name: string, type: ZType | ZFunctionType, pos: Position, address?: ASM.Address} & DeclarationDetails
    type DeclarationDetails = {used:boolean, initialized:boolean};
    export class Scope {
        private readonly data = new Map<string,Declaration>;
        public constructor(public parent?: Scope) {}
        protected get n() {
            return this.parent ? this.parent.n + 1 : 0;
        }
        public declare(name: string, type: ZType | ZFunctionType, pos: Position, dtls?: Partial<DeclarationDetails>) {
            if(this.hasLocal(name,pos)) {
                ZLang.raise(SemanticErrors.REIDENT,`Cannot redeclare '${name}'`,pos);
                return false;
            }
            this.data.set(name, {n: this.n,name,type,pos,used:false,initialized:false,...(dtls??{})});
            return true;
        }

        public has(name: string, pos?: Position): boolean {
            return this.hasLocal(name,pos) || (this.parent !== undefined && this.parent.has(name,pos));
        }

        public hasLocal(name: string, pos?: Position): boolean {
            return this.data.has(name) && (pos === undefined || Position.offset(pos,this.data.get(name).pos) <= 0);
        }
        public get(name: string ,pos?: Position): Declaration | null {
            return this.hasLocal(name,pos) ? {...this.data.get(name)} : this.parent ? this.parent.get(name,pos) : null;
        }
        public mark(name: string, pos: Position | undefined, dtls: Partial<DeclarationDetails>) {
            if(this.hasLocal(name,pos)) {
                this.data.set(name,Object.assign(this.data.get(name), dtls));

                const t = this.get(name).type;
                // When implementing function, change it to be const
                if(dtls.initialized && t instanceof ZFunctionType) {
                    t.const = true;
                }

                return true;
            } else if(this.parent) {
                return this.parent.mark(name,pos,dtls);
            } else {
                ZLang.raise(SemanticErrors.UNDECL,`Variable '${name}' has not been declared`, pos);
                return false;
            }
        }

        public setAddress(name: string, address: ASM.Address) {
            if(this.hasLocal(name)) {
                this.data.get(name).address = address;
            } else {
                throw new Error(`Scope does not contain '${name}'. This is not a user issue.`);
            }
        }

        public entries(): [string,Declaration][] {
            return [
                ...(this.parent ? this.parent.entries() : []),
                ...this.data.entries()
            ];
        }

        public dir(pos?: Position): Declaration[] {
            const dir = [];
            for(const [k,v] of this.entries()) {
                if(pos === undefined || Position.offset(pos,v.pos) <= 0) {
                    dir.push(v)
                }
            }

            return dir;
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

    export function applySemantics(program: Program) {
        initSymbols(program);
        return program;
    }

    function initSymbols(program: Program) {
        ZLang.visit(program,function(node,V: Set<Nodes.ZNode>) {
            // Set up scopes
            if((node instanceof StatementGroup || node instanceof Nodes.FunctionNode) && !node.scope.parent) {
                const scope = getEnclosingScope(node);
                if(scope) {
                    node.scope.parent = scope;
                }
            }

            function declareFunction(header: Nodes.FunctionHeaderNode) {
                return getEnclosingScope(node).declare(header.name, new ZFunctionType(
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

                scope.mark(node.header.ident.name,node.header.ident.pos,{initialized:true});
                V.add(node.header);
                V.add(node.rvar);

                for(const p of node.header.parameters) {
                    node.scope.declare(p.ident.name,p.type.ztype,p.ident.pos,{initialized: true});
                }

                node.scope.declare(node.rvar.name,node.header.rtype.ztype,node.rvar.pos,{initialized: true});

            } else if(node instanceof Nodes.DeclareStatement) {
                const scope = getEnclosingScope(node);
                for(const [idents,value] of node.entries) {
                    for(const ident of idents) {
                        scope.declare(ident.name, node.type.ztype, ident.pos);
                        if(value !== undefined) {
                            scope.mark(ident.name,ident.pos,{initialized:true});
                        }
                        V.add(ident);
                    }
                }
            } else if(node instanceof Nodes.AssignmentStatement) {
                const scope = getEnclosingScope(node);
                
                if(!scope.has(node.ident.name,node.pos)) {
                    ZLang.raise(SemanticErrors.UNDECL,`Variable '${node.ident.name}' has not been declared`, node.pos);
                    return false;
                } else if(scope.get(node.ident.name,node.pos).type.const) {
                    ZLang.raise(SemanticErrors.CONST,`Cannot assign to const variable '${node.ident.name}'`,node.pos);
                    return false;
                } else {
                    scope.mark(node.ident.name,node.pos,{initialized:true});
                    V.add(node.ident);
                }
            } else if(node instanceof Nodes.IdentifierNode) {
                return getEnclosingScope(node).mark(node.name,node.pos,{used: true});
            }
        },'pre');
    }

    console.debug('Building Scanner...');
    const SCANNER = Scanner.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.lut"
    ])), 'zlex.json.lz');
    console.debug('Done!');

    export async function* tokenizeFile(file: string) {
        const inStream = await system.createTextFileReadStream(file);
        yield* SCANNER.tokenize((function*() {
            while(true) yield inStream.read(1) as char;
        })());
    }

    export function tokenize(text: string) {
        return SCANNER.tokenize(text.split('')[Symbol.iterator]());
    }

    export function parse(text: string): Program {
        return ZLang.parseTokens(ZLang.tokenize(text)) as Program;
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


const [tokenSrc,astOutput,symbtableOutput = 'program.sym'] = system.args.slice(1);
console.debug('Parsing...');

// Read tokens
const tokens = readTokenStream(tokenSrc);

// Parse
const ast = (function() {
    try {
        return ZLang.parseTokens(tokens);
    } catch(e) {
        output('SYNTAX',e?.pos?.line??0,e?.pos?.col??0,'SYNTAX');
        system.exit(1);
    }
})();


// Semantic error handeling
let hasErrors = false;
import SemanticErrors = ZLang.SemanticErrors;
ZLang.raise = function(errno,message,pos) {
    switch(errno) {
        case SemanticErrors.REIDENT: {
            output('WARN', pos.line, pos.col, SemanticErrors[SemanticErrors.REIDENT]);
            return;
        }
        case SemanticErrors.EXPR: {
            hasErrors = true;
            console.error(message)
            output('ERROR',pos.line,pos.col,SemanticErrors[SemanticErrors.EXPR]);
            return;
        }
    }
}

ZLang.applySemantics(ast);

// Emit Domain Statements
ZLang.visit(ast, function(node) {
    if(node instanceof ZLang.Nodes.DomainNode) {
        output('DOMAIN',node.pos.line,node.pos.col,node.domain);
        return;
    }

    // Validate operator types
    // This is not the same as typechecking for assignment
    if(node instanceof ZLang.Nodes.BinaryOp) {
        if(
            (node.name === '%' && (node.lhs.domain !== 'int' || node.rhs.domain !== 'int'))
            || node.lhs.domain === 'bool' || node.lhs.domain === 'string'
            || node.rhs.domain === 'bool' || node.rhs.domain === 'string'
        ) {
                ZLang.raise(SemanticErrors.EXPR, `Operator '${node.name}' is not valid for types ${node.lhs.domain} and ${node.rhs.domain}`,node.pos);                
                return false;
        }
    }
    if(node instanceof ZLang.Nodes.UnaryOp) {
        if(
            (node.name === '~' && node.val.domain !== 'int')
            || (node.name === '!' && node.val.domain !== 'bool')
            || ((node.name === '+' || node.name === '-') && (node.val.domain === 'string' || node.val.domain === 'bool'))
        ) {
            ZLang.raise(SemanticErrors.EXPR, `Operator '${node.name}' is not valid for type ${node.val.domain}`,node.pos)
            return false;
        }
    }

    // Validate function identifiers are not used as variables
    if(
        node instanceof ZLang.Nodes.IdentifierNode
        // Ignore parameters in lone function prototype, they aren't declared
        && ZLang.getEnclosingScope(node).has(node.name,node.pos)
        && ZLang.getEnclosingScope(node).get(node.name,node.pos).type instanceof ZLang.ZFunctionType
    ) {
        const parent = node.parent;
        if(!(
            (parent instanceof ZLang.Nodes.FunctionCallNode && parent.ident === node)
            || (parent instanceof ZLang.Nodes.FunctionHeaderNode && parent.ident === node)
        )) {
            ZLang.raise(SemanticErrors.EXPR, `Function '${node.name}' cannot be treated like a variable!`, node.pos); // node.pos for ident location, parent.pos for what expects a var
            return false;
        }
    }

    if(node instanceof ZLang.Nodes.IdentifierNode) {
        // issue would have already been raised above, this is just to ensure domain is valid
        return ZLang.getEnclosingScope(node).has(node.name,node.pos);
    }
},'post');

// Emit Symtables
ZLang.visit(ast,function(node) {
    if(symbtableOutput && node instanceof ZLang.Nodes.EmitStatement && node.data.type === 'symbtable') {
        system.writeTextFileSync(symbtableOutput,ZLang.getEnclosingScope(node).dir(node.pos).map(d => [d.n,d.type,d.name].join(',')).join('\n'));
    }
});

/**/

// TODO, dump ast
dump('zlang', ast);

console.debug('Done!');
// system.exit(hasErrors ? 1 : 0); TODO enable after awaiting ast write
///#endif