///#pragma once

///#include <decorators.ts>

type SubTree<K extends Tree = Tree> = K & { parent: Tree };
type StrayTree<K extends Tree = Tree> = K & { parent: undefined };

abstract class Tree {
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

    protected push(...items: Tree[]): number {
        return this.#children.push(...items.map(tree => this.#own(tree)));
    }
    protected pop(): StrayTree<Tree> | undefined {
        return this.#disown(this.#children.pop());
    }

    protected unshift(...items: Tree[]): number {
        return this.#children.unshift(...items.map(tree => this.#own(tree)));
    }
    protected shift(): StrayTree<Tree> | undefined {
        return this.#disown(this.#children.shift());
    }

    protected splice(start: number, deleteCount?: number | undefined): StrayTree<Tree>[];
    protected splice(start: number, deleteCount: number, ...items: Tree[]): StrayTree<Tree>[];
    protected splice(start: number, deleteCount: number, ...items: Tree[]): StrayTree<Tree>[] {
        return this.#children.splice(start, deleteCount, ...items.map(tree => this.#own(tree))).map(tree => this.#disown(tree));
    }

    protected at(index: number): SubTree<Tree> | undefined {
        return this.#children.at(index) as SubTree<Tree> | undefined;
    }

    protected get length(): number {
        return this.#children.length;
    }

    protected forEach(callbackfn: (value: SubTree<Tree>, index: number, parent: Tree) => void, thisArg?: any): void {
        if (thisArg !== undefined) {
            callbackfn = callbackfn.bind(thisArg);
        }
        return this.#children.forEach((tree, index) => callbackfn(tree, index, this));
    }

    protected values(): IterableIterator<Tree> {
        return this.#children.values();
    }

    public get [Symbol.toStringTag]() {
        return 'Tree';
    }

    protected [Symbol.iterator]() {
        return this.#children[Symbol.iterator]();
    }
}

namespace Tree {
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

    export function nested<TreeType extends Tree>(tree: TreeType): NestedTree<TreeType> {
        return tree as NestedTree<TreeType>;
    }
}

import NestedTree = Tree.NestedTree;

type ArrayTreeMethods = Pick<Array<Tree>, 'length' | 'values' | 'at' | 'push' | 'unshift' | 'pop' | 'shift' | 'splice' | typeof Symbol.iterator>;
class ArrayTree extends Tree implements ArrayTreeMethods {
    public override get length() {
        return super.length;
    }

    public override at = super.at;
    public override values = super.values;
    public override push = super.push;
    public override unshift = super.unshift;
    public override pop = super.pop;
    public override shift = super.shift;
    public override splice = super.splice;
    public override [Symbol.iterator] = super[Symbol.iterator];

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
        this.splice(0,1,value);
    }
    @enumerable
    public get left(): SubTree<Tree> | undefined {
        return this.at(0);
    }

    public set right(value: Tree) {
        this.splice(1,1,value);
    }
    @enumerable
    public get right(): SubTree<Tree> | undefined {
        return this.at(1);
    }

    public override get [Symbol.toStringTag]() {
        return 'BinaryTree';
    }
}


const root = Tree.nested(new ArrayTree());