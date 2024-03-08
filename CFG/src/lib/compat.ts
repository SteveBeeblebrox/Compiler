///#pragma once
//@ts-nocheck
declare function require(arg: string);
fs = require('fs');
declare var fs;

const system = {
    args: process.argv.slice(1),
    exit: process.exit as (status?:number)=>never,
    readFile(path: string): string {
        return fs.readFileSync(path, {encoding:'utf8'});
    },
    writeFile(path: string, data: string) {
        fs.writeFileSync(path, data, {encoding:'utf8'});
    },
    async createFileReadStream(path: string) {
        const stream = fs.createReadStream(path, {encoding:'utf8'});
        void await new Promise(function(resolve,reject) {
            stream.on('readable',resolve);
            stream.on('error',reject);
        });
        return stream;
    },
    async createFileWriteStream(path: string) {
        const stream = fs.createWriteStream(path, {encoding:'utf8'});
        return stream;
    }
}

const throws = (e: any) => {throw e};

function installPolyfill<T>(base: { new(...args: any[]): T }, pollyfill: { [key: PropertyKey]: (this: T, ...args: any[]) => any }, debug = false) {
    for (const [name, func] of Object.entries(pollyfill)) {
        if (!(name in base.prototype)) {
            Object.defineProperty(base.prototype, name, { value: func, configurable: debug });
        }
    }
}

interface Object {
    groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]};
}

Object.groupBy ??= function groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]} {
  return values.reduce((obj, value, index) => {
    const key = callback(value,index);
    obj[key] = [...(obj[key]??[]), value];
    return obj;
  }, {} as {[key in Key]: T[]});
}

interface Array<T> {
    at(this: T[], index: number): T | undefined;
    flat(this: (T|T[])[],depth:number): T[];
    flatMap<U, This>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[]
}

Array.prototype.at ??= function at(this: T[], index: number) {
    index*=1;
    if(index >= 0) {
        return this[index];
    } else if (index < 0) {
        return this[this.length + index];
    } else {
        throw new TypeError(`Argument to at() is not a number`);
    }
}

Array.prototype.flat ??= function flat<T>(this: (T|T[])[],depth:number=1): T[] {
    return depth ? Array.prototype.reduce.call(this, function(flattened: unknown[], value: unknown) {
        if (Array.isArray(value)) {
            flattened.push.apply(flattened, flat.call(value, depth - 1));
        } else {
            flattened.push(value);
        }

        return flattened;
    } as any, [] as T[]) as T[] : Array.prototype.slice.call(this) as T[];
}

Array.prototype.flatMap ??= function flatMap<T,U, This>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[] {
    return Array.prototype.map.call(this, callback, thisArg).flat();
}

///#include "set.ts"
///#include "iterator.ts"
///#include "asynciterator.ts"