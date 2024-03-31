///#pragma once
declare interface Iterator<T, TReturn = any, TNext = undefined> {
    shift(): T | undefined;
}

namespace IteratorShiftPolyfill {
    export function shift<T>(this: Iterator<T>): T | undefined {
        return this.next().value;
    }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((function*(){}).prototype))} as any,IteratorShiftPolyfill);

declare interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    shift(): T | undefined;
}

namespace AsyncIteratorShiftPolyfill {
    export async function shift<T>(this: AsyncIterator<T>): Promise<T | undefined> {
        return (await this.next()).value;
    }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((async function*(){}).prototype))} as any,AsyncIteratorShiftPolyfill);