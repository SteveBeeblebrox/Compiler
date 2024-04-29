///#pragma once

///#include <tree.ts>
///#include <graphviz.ts>

namespace Parsing {
    abstract class AbstractParseTree<NameType extends string = string> extends Tree {
        constructor(public readonly name?: NameType) {super();}
    }

    export class ParseTreeNode extends AbstractParseTree<NonTerminal> implements ArrayTreeMethods {
        constructor(name?: NonTerminal) {super(name);}
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
        constructor() {super(CFG.LAMBDA_CHARACTER);}
        readonly [Graphviz.label] = CFG.LAMBDA_CHARACTER;
    }

    export class ParseTreeEOFNode extends AbstractParseTree<typeof CFG.EOF_CHARACTER> {
        constructor() {super(CFG.EOF_CHARACTER);}
        readonly [Graphviz.label] = CFG.EOF_CHARACTER;
    }

    export class ParseTreeTokenNode extends AbstractParseTree<Terminal> {
        constructor(name: Terminal, public value?: string) {super(name);}
        get [Graphviz.label] () {
            return this.name;
        }
    }

    type ParseTreeLeaf = Tree & Omit<ParseTreeLambdaNode | ParseTreeEOFNode | ParseTreeTokenNode, typeof Graphviz.label>;
    export type InnerParseTree = NestedTree<ParseTreeNode, ParseTreeNode | ParseTreeLeaf, false> & {parent?: ParseTree};
    export type ParseTree = InnerParseTree | ParseTreeLeaf; 

    export type ParseResult<ASTNodeType extends Tree = never> = ASTNodeType | StrayTree<ParseTree>;

    export class SyntaxError extends Error {
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

        private readonly rules: Map<NonTerminal | '*', (node: StrayTree<ParseTreeNode>)=>void | ParseTree | ParseTree[] | StrayTree<ASTNodeType> | StrayTree<ASTNodeType>[]>;

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
        transform(node: StrayTree<ParseTreeNode>) {
            for(const rule of [node.name,'*'] as [...NonTerminal[], '*']) {
                if(this.rules.has(rule)) {
                    const rvalue = this.rules.get(rule).bind(node)(node);
                    if(rvalue !== undefined) {
                        return rvalue;
                    }
                }
            }
            return node;
            /*
            // Hold a reference to the current parrent
                    const parent = Current.parent as InnerParseTree;

                    // Disjoin completed node
                    const node = parent.pop() as ParseTreeNode;
                    let rvalue: any = node;
                    
                    // Apply NonTerminal specific transforms
                    if(rvalue === node && this.sdt.has(node.name as NonTerminal)) {
                        rvalue = this.sdt.get(node.name as NonTerminal)(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }

                    // Apply wildcard transforms
                    if(rvalue === node && this.sdt.has('*')) {
                        rvalue = this.sdt.get('*')(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }
                    
                    // Restore connections
                    if(Array.isArray(rvalue)) {
                        parent.push(...rvalue);
                    } else if(rvalue != null) {
                        parent.push(rvalue as InnerParseTree);
                    }

                    // Continue parsing
                    Current = parent as InnerParseTree;
            
            
            
            
            
            */
        }
    }
}