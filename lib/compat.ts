///#pragma once
///#define strc(x) #x

///#include <compat/globalthis.ts>

declare interface SymbolConstructor {
    readonly dispose: unique symbol,
    readonly asyncDispose: unique symbol,
}

//@ts-expect-error
Symbol['dispose'] ??= Symbol('dispose');
//@ts-expect-error
Symbol['asyncDispose'] ??= Symbol('asyncDispose');

declare var system: {
    args: string[];
    exit(status?: number): never;
    readTextFileSync(path: string): string;
    writeTextFileSync(path: string, data: string);
    createTextFileReadStream(path: string): Promise<{read(bytes: number): string, [Symbol.dispose]():void}>;
    createTextFileWriteStream(path: string): Promise<{write(text: string): void, [Symbol.dispose]():void}>;
};

globalThis['system'] ??= {
    //@ts-expect-error
    args: process.argv.slice(1),
    //@ts-expect-error
    exit: process.exit as (status?:number)=>never,
    readTextFileSync(path: string): string {
        //@ts-expect-error
        return require('fs').readFileSync(path, {encoding:'utf8'});
    },
    writeTextFileSync(path: string, data: string) {
        //@ts-expect-error
        require('fs').writeFileSync(path, data, {encoding:'utf8'});
    },
    async createTextFileReadStream(path: string) {
        //@ts-expect-error
        const stream = require('fs').createReadStream(path, {encoding:'utf8'});
        void await new Promise(function(resolve,reject) {
            stream.on('readable',resolve);
            stream.on('error',reject);
        });
        stream[Symbol.dispose] = ()=>{};
        return stream;
    },
    async createTextFileWriteStream(path: string) {
        //@ts-expect-error
        const stream = require('fs').createWriteStream(path, {encoding:'utf8'});
        stream[Symbol.dispose] = ()=>{};
        return stream;
    }
}

system['createTextFileReadStream'] ??= async function createTextFileReadStream(path: string) {
    //@ts-expect-error
    const file = system.openSync(path, {read: true});
    return {
        read(bytes: number): string {
            const buf = new Uint8Array(bytes);
            file.readSync(buf);
            return new TextDecoder().decode(buf);
        },
        [Symbol.dispose]() {
            file.close();
        }
    }
}

system['createTextFileWriteStream'] ??= async function createTextFileWriteStream(path: string) {
    //@ts-expect-error
    const file = system.openSync(path, {write: true, create: true});
    return {
        write(text: string) {
            file.writeSync(new TextEncoder().encode(text));
        },
        [Symbol.dispose]() {
            file.close();
        }
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