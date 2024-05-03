///#pragma once

///#include <tree.ts>
///#include <graphviz.ts>

namespace Parsing {
    abstract class AbstractParseTree<NameType extends string = string> extends Tree {
        constructor(public readonly name?: NameType) {super();}
        abstract get pos(): Position | undefined;
    }

    export class ParseTreeNode extends AbstractParseTree<NonTerminal> implements ArrayTreeMethods {
        constructor(name?: NonTerminal) {
            super(name);
        }

        public get pos() {
            return (this.at(0) as AbstractParseTree)?.pos;
        }

        public override get parent() {
            return super.parent as ParseTree;
        }

        public get length() {
            return super[Tree.treeLength];
        }

        public at = super[Tree.at];
        public values = super[Tree.values];
        public push = super[Tree.push];
        public unshift = super[Tree.unshift];
        public pop = super[Tree.pop];
        public shift = super[Tree.shift];
        public splice = super[Tree.splice];
        public [Symbol.iterator] = super[Tree.iterator];
    
        @enumerable
        public get children() {
            return [...this];
        }

        get [Graphviz.label] () {
            return this.name;
        }
        get [Graphviz.children]() {
            return this.children.map(x=>['',x]);
        }
    }

    export class ParseTreeLambdaNode extends AbstractParseTree<typeof CFG.LAMBDA_CHARACTER> {
        public readonly pos: undefined;
        constructor() {
            super(CFG.LAMBDA_CHARACTER);
        }
        readonly [Graphviz.label] = CFG.LAMBDA_CHARACTER;
    }

    export class ParseTreeEOFNode extends AbstractParseTree<typeof CFG.EOF_CHARACTER> {
        public readonly pos: undefined;
        constructor() {
            super(CFG.EOF_CHARACTER);
        }
        readonly [Graphviz.label] = CFG.EOF_CHARACTER;
    }

    export class ParseTreeTokenNode extends AbstractParseTree<Terminal> {
        public readonly pos: Position | undefined;
        constructor(name: Terminal, public value?: string, pos?: Position) {
            super(name);
            this.pos = pos;
        }
        get [Graphviz.label]() {
            return this.name === this.value ? this.name : `${this.name}:${this.value}`;
        }
        get [Graphviz.children]() {
            return [];
        }
    }

    ///#warning fix up parse tree types
    type ParseTreeLeaf = Tree & Omit<ParseTreeLambdaNode | ParseTreeEOFNode | ParseTreeTokenNode, typeof Graphviz.label>;
    export type InnerParseTree = ParseTreeNode;//NestedTree<ParseTreeNode, ParseTreeNode | ParseTreeLeaf, false> & {parent?: ParseTree};
    export type ParseTree = ParseTreeNode;//InnerParseTree | ParseTreeLeaf; 

    export type ParseResult<ASTNodeType extends Tree = never> = ASTNodeType | StrayTree<ParseTree>;

    export class SyntaxError extends Error {
        constructor(message?: string, public pos?: Position) {
            super(message);
        }
    }
    export class LexError extends Error {
        constructor(message?: string, public pos?: Position) {
            super(message);
        }
    }
    export class SemanticError extends Error {
        constructor(message?: string, public pos?: Position) {
            super(message);
        }
    }

    /*
        void - nothing happened, run * transform if given
        ParseTreeNode | ASTNodeType | ASTNodeType[] - replace with return value and break
        null - delete node
    */

    export class SyntaxTransformer<ASTNodeType extends Tree=Tree> {
        private readonly rules: Map<NonTerminal | '*', (node: StrayTree<ParseTreeNode>)=>null | void | ParseTree | ParseTree[] | StrayTree<ASTNodeType> | StrayTree<ASTNodeType>[]>;

        constructor(rules: SyntaxTransformer<ASTNodeType>['rules'] | {[key: string]: MapValue<SyntaxTransformer<ASTNodeType>['rules']>}) {
            this.rules = rules instanceof Map ? rules : new Map(Object.entries(rules)) as SyntaxTransformer<ASTNodeType>['rules'];
        
            for(const [key,value] of this.rules.entries()) {
                if(key.includes('|')) {
                    for(const branch of key.split('|').map(x=>x.trim())) {
                        this.rules.set(branch as NonTerminal | '*',value);
                    }
                    this.rules.delete(key);
                }
            }
        }
        transform(node: StrayTree<ParseTreeNode>): Exclude<ReturnType<MapValue<SyntaxTransformer<ASTNodeType>['rules']>>,void> {
            for(const rule of [node.name,'*'] as [...NonTerminal[], '*']) {
                if(this.rules.has(rule)) {
                    const rvalue = this.rules.get(rule).bind(node)(node);
                    if(rvalue !== undefined) {
                        return rvalue;
                    }
                }
            }
            return node;
        }
    }

    export class TokenTransformer<TokenNodeType extends Tree=Tree> {
        private readonly rules: Map<Terminal | '*', (node: ParseTreeTokenNode)=>ParseTreeTokenNode|TokenNodeType|void>;

        constructor(rules: TokenTransformer<TokenNodeType>['rules'] | {[key: string]: MapValue<TokenTransformer<TokenNodeType>['rules']>}) {
            this.rules = rules instanceof Map ? rules : new Map(Object.entries(rules)) as TokenTransformer<TokenNodeType>['rules'];
        
            for(const [key,value] of this.rules.entries()) {
                if(key.includes('|')) {
                    for(const branch of key.split('|').map(x=>x.trim())) {
                        this.rules.set(branch as Terminal | '*',value);
                    }
                    this.rules.delete(key);
                }
            }
        }
        transform(node: ParseTreeTokenNode): Exclude<ReturnType<MapValue<TokenTransformer<TokenNodeType>['rules']>>,void> {
            for(const rule of [node.name,'*'] as [...Terminal[], '*']) {
                if(this.rules.has(rule)) {
                    const rvalue = this.rules.get(rule).bind(node)(node);
                    if(rvalue !== undefined) {
                        return rvalue;
                    }
                }
            }
            return node;
        }
    }
}