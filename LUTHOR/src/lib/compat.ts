///#pragma once
//@ts-nocheck
declare function require(arg: string);
fs = require('fs');
declare var fs;

const system = {
    args: process.argv.slice(1),
    exit: process.exit,
    readFile(path: string): string {
        return fs.readFileSync(path, {encoding:'utf8'});
    },
    writeFile(path: string, data: string) {
        fs.writeFileSync(path, data, {encoding:'utf8'})
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
    flat(this: (T|T[])[],depth:number): T[];
    flatMap<U, This>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[]
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
