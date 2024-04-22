///#pragma once
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
    }

    export class ParseTreeLambdaLeaf extends AbstractParseTree<typeof CFG.LAMBDA_CHARACTER> {
        constructor() {super(CFG.LAMBDA_CHARACTER);}
    }

    export class ParseTreeEOFLeaf extends AbstractParseTree<typeof CFG.EOF_CHARACTER> {
        constructor() {super(CFG.EOF_CHARACTER);}
    }

    export class ParseTreeTokenLeaf extends AbstractParseTree<Terminal> {
        constructor(name: Terminal, public value?: string) {super(name);}
    }

    export type ParseTreeLeaf = ParseTreeLambdaLeaf | ParseTreeEOFLeaf | ParseTreeTokenLeaf;
    export type InnerParseTree = NestedTree<ParseTreeNode, ParseTreeNode | ParseTreeLeaf, false> & {parent?: ParseTree};
    export type ParseTree = InnerParseTree | ParseTreeLeaf; 

    export type ParseResult<ASTNodeType extends Tree = never> = ASTNodeType | StrayTree<ParseTree>;

    export class SyntaxError extends Error {
        constructor(message?: string, public pos?: Position) {
            super(message);
        }
    }
}