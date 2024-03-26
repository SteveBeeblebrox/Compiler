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
}

installPolyfill(Array,ArrayPolyfill);
