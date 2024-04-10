///#pragma once

///#include <decorators.ts>

namespace TreeUtil {
    export type SubTree<K extends Tree = Tree> = K & { parent: Tree };
    export type StrayTree<K extends Tree = Tree> = K & { parent: undefined };

    abstract class TreeInternals {
        protected static readonly treeLength = Symbol('Tree.treeLength');
        protected static readonly values = Symbol('Tree.values');
        protected static readonly at = Symbol('Tree.at');
        protected static readonly push = Symbol('Tree.push');
        protected static readonly unshift = Symbol('Tree.unshift');
        protected static readonly pop = Symbol('Tree.pop');
        protected static readonly shift = Symbol('Tree.shift');
        protected static readonly splice = Symbol('Tree.splice');
        protected static readonly iterator = Symbol('Tree.iterator');
        protected static readonly forEach = Symbol('Tree.forEach');
    }

    export abstract class Tree extends TreeInternals {
        readonly #children: SubTree<Tree>[] = [];
        #parent: Tree | undefined = undefined;

        get parent(): Tree | undefined {
            return this.#parent;
        }

        #disown(other: undefined): undefined;
        #disown(other: Tree): StrayTree<Tree>;
        #disown(other: Tree | undefined): StrayTree<Tree> | undefined;
        #disown(other: Tree | undefined): StrayTree<Tree> | undefined {
            if (other !== undefined) {
                other.#parent = undefined;
            }
            return other as StrayTree<Tree> | undefined;
        }

        #own(other: undefined): never;
        #own(other: Tree): SubTree<Tree>;
        #own(other: Tree | undefined): SubTree<Tree>;
        #own(other: Tree | undefined): SubTree<Tree> {
            if (other === undefined) {
                throw new Error('Cannot take ownership of undefined');
            }
            if (other === this) {
                throw new Error('Cannot take ownership of self');
            }
            if (other.parent !== undefined) {
                throw new Error('Cannot take ownership of a subtree');
            }

            let ancestor: Tree | undefined = this;
            do {
                if (ancestor === other) {
                    throw new Error('Cannot take ownership of ancestor');
                }
            } while (ancestor = ancestor.parent);

            other.#parent = this;
            return other as SubTree<Tree>;
        }

        protected [TreeInternals.push](...items: Tree[]): number {
            return this.#children.push(...items.map(tree => this.#own(tree)));
        }
        protected [TreeInternals.pop](): StrayTree<Tree> | undefined {
            return this.#disown(this.#children.pop());
        }

        protected [TreeInternals.unshift](...items: Tree[]): number {
            return this.#children.unshift(...items.map(tree => this.#own(tree)));
        }
        protected [TreeInternals.shift](): StrayTree<Tree> | undefined {
            return this.#disown(this.#children.shift());
        }

        protected [TreeInternals.splice](start: number, deleteCount?: number | undefined): StrayTree<Tree>[];
        protected [TreeInternals.splice](start: number, deleteCount: number, ...items: Tree[]): StrayTree<Tree>[];
        protected [TreeInternals.splice](start: number, deleteCount: number, ...items: Tree[]): StrayTree<Tree>[] {
            return this.#children.splice(start, deleteCount, ...items.map(tree => this.#own(tree))).map(tree => this.#disown(tree));
        }

        protected [TreeInternals.at](index: number): SubTree<Tree> | undefined {
            return this.#children.at(index) as SubTree<Tree> | undefined;
        }

        protected get [TreeInternals.treeLength](): number {
            return this.#children.length;
        }

        protected [TreeInternals.forEach](callbackfn: (value: SubTree<Tree>, index: number, parent: Tree) => void, thisArg?: any): void {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return this.#children.forEach((tree, index) => callbackfn(tree, index, this));
        }

        protected [TreeInternals.values](): IterableIterator<Tree> {
            return this.#children.values();
        }

        public get [Symbol.toStringTag]() {
            return 'Tree';
        }

        protected [TreeInternals.iterator]() {
            return this.#children[Symbol.iterator]();
        }
    }

    type NestedTreeModifier<T,TreeType extends Tree> =
        T extends SubTree ? SubTree<NestedTree<TreeType>>
        : T extends StrayTree ? StrayTree<NestedTree<TreeType>>
        : T extends Tree ? NestedTree<TreeType>
        : T extends (...args: infer ParameterTypes)=>infer ReturnType ? (...args: NestedTreeModifier<ParameterTypes,TreeType>)=>NestedTreeModifier<ReturnType,TreeType>
        : T extends [...any] ? ({[K in keyof T]: NestedTreeModifier<T[K],TreeType>})
        : T
    ;

    export type NestedTree<TreeType extends Tree> = Tree & {
        [key in keyof TreeType]: NestedTreeModifier<TreeType[key],TreeType>
    }
}

import NestedTree = TreeUtil.NestedTree;
import Tree = TreeUtil.Tree;
import SubTree = TreeUtil.SubTree;
import StayTree = TreeUtil.StrayTree;

type ArrayTreeMethods = Pick<Array<Tree>, 'length' | 'values' | 'at' | 'push' | 'unshift' | 'pop' | 'shift' | 'splice' | typeof Symbol.iterator>;
class ArrayTree extends Tree implements ArrayTreeMethods {
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
    
    public override get [Symbol.toStringTag]() {
        return 'ArrayTree';
    }
}

class BinaryTree extends Tree {
    public set left(value: Tree) {
        this[Tree.splice](0,1,value);
    }
    @enumerable
    public get left(): SubTree<Tree> | undefined {
        return this[Tree.at](0);
    }

    public set right(value: Tree) {
        this[Tree.splice](1,1,value);
    }
    @enumerable
    public get right(): SubTree<Tree> | undefined {
        return this[Tree.at](1);
    }

    public override get [Symbol.toStringTag]() {
        return 'BinaryTree';
    }
}