///#pragma once
declare interface Array<T> {
    at(this: T[], index: number): T | undefined;
    flat(this: (T|T[])[],depth:number): T[];
    flatMap<U, This>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[]
}

namespace ArrayPolyfill {
    export function at<T>(this: T[], index: number) {
        index*=1;
        if(index >= 0) {
            return this[index];
        } else if (index < 0) {
            return this[this.length + index];
        } else {
            throw new TypeError(`Argument to at() is not a number`);
        }
    }
    
    export function flat<T>(this: (T|T[])[],depth:number=1): T[] {
        return depth ? Array.prototype.reduce.call(this, function(flattened: unknown[], value: unknown) {
            if (Array.isArray(value)) {
                flattened.push.apply(flattened, flat.call(value, depth - 1));
            } else {
                flattened.push(value);
            }
    
            return flattened;
        } as any, [] as T[]) as T[] : Array.prototype.slice.call(this) as T[];
    }
    
    export function flatMap<T,U, This>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[] {
        return Array.prototype.map.call(this, callback, thisArg).flat();
    }

    export function toReversed<T>(this: T[]): T[] {
        return [...this.values()].reverse();
    }
    export function toSorted<T>(this: T[], compareFn?: (a: T, b: T) => number): T[] {
        return [...this.values()].sort(compareFn);
    }
    export function toSpliced<T>(this: T[], start: number, deleteCount?: number, ...items: T[]): T[] {
        const array = [...this.values()];
        array.splice(start,deleteCount,...items);
        return array;
    }
    ArrayPolyfill['with'] = {
        'with': function<T>(this: T[], index: number, value: T): T[] {
            const array = [...this.values()];

            index*=1;
            if(index >= 0) {
                this[index] = value;
            } else if (index < 0) {
                this[this.length + index] = value;
            } else {
                throw new TypeError(`First argument to with() is not a number`);
            }

            return array;
        }
    }['with'];
}

installPolyfill(Array,ArrayPolyfill);

declare interface ArrayConstructor {
    entries<T>(arr: ArrayLike<T>): [number,T][];
}

namespace ArrayConstructorPolyfill {
    export function entries<T>(arr: ArrayLike<T>) {
        return Array.prototype.map.apply(arr, [(t,i)=>[i,t]]);
    }
}

installPolyfill({prototype: Array} as any, ArrayConstructorPolyfill)