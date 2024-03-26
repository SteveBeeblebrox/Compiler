///#pragma once
///#define strc(x) #x
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

///#include <compat/array.ts>
///#include <compat/asynciterator.ts>
///#include <compat/iterator.ts>
///#include <compat/object.ts>
///#include <compat/set.ts>