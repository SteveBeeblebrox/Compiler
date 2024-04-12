///#pragma once
// Iterator Polyfill based off of work by
// Axel Rauschmayer, (c) 2021 MIT License
// https://github.com/rauschma/iterator-helpers-polyfill
declare interface Iterator<T, TReturn = any, TNext = undefined> {
    [Symbol.iterator](): Iterator<T, TReturn, TNext>;
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
  
    map<U>(mapper: (value: T, counter: number) => U): Iterator<U>;
    filter(filterer: (value: T, counter: number) => boolean): Iterator<T>;
    take(limit: number): Iterator<T>;
    drop(limit: number): Iterator<T>;
    flatMap<U>(
      mapper: (value: T, counter: number) => Iterable<U> | Iterator<U> | Iterable<U> | Iterator<U>
    ): Iterator<U>;
    reduce<U>(
      reducer: (accumulator: U, value: T, counter: number) => U,
      initialValue?: U
    ): U;
    toArray(): Array<T>;
    forEach(fn: (value: T, counter: number) => void): void;
    some(fn: (value: T, counter: number) => boolean): boolean;
    every(fn: (value: T, counter: number) => boolean): boolean;
    find(fn: (value: T, counter: number) => boolean): undefined | T;
    toAsync(): AsyncIterator<T>;
}

namespace IteratorPolyfill {
    const NO_INITIAL_VALUE = Symbol();

    export function* map<T,U>(this: Iterator<T>, mapper: (value: T, counter: number) => U): Iterator<U> {
        let counter = 0;
        for (const value of this) {
            yield mapper(value, counter);
            counter++;
        }
    }

    export function* filter<T>(this: Iterator<T>, filterer: (value: T, counter: number) => boolean): Iterator<T> {
        let counter = 0;
        for (const value of this) {
            if (filterer(value, counter)) {
                yield value;
            }
            counter++;
        }
    }

    export function* take<T>(this: Iterator<T>, limit: number): Iterator<T> {
        let counter = 0;
        for (const value of this) {
            if (counter >= limit) break;
            yield value;
            counter++;
        }
    }

    export function* drop<T>(this: Iterator<T>, limit: number): Iterator<T> {
        let counter = 0;
        for (const value of this) {
            if (counter >= limit) {
                yield value;
            }
            counter++;
        }
    }

    export function* flatMap<T,U>(
        this: Iterator<T>, mapper: (value: T, counter: number) => Iterable<U> | Iterator<U>
    ): Iterator<U> {
        let counter = 0;
        for (const value of this) {
            yield* mapper(value, counter);
            counter++;
        }
    }

    export function reduce<T,U>(
        this: Iterator<T>, 
        reducer: (accumulator: U, value: T, counter: number) => U,
        initialValue: typeof NO_INITIAL_VALUE | U = NO_INITIAL_VALUE
    ): U {
        let accumulator = initialValue;
        let counter = 0;
        for (const value of this) {
            if (accumulator === NO_INITIAL_VALUE) {
                accumulator = value as any;
                continue;
            }
            accumulator = reducer(accumulator, value, counter);
            counter++;
        }
        if (accumulator === NO_INITIAL_VALUE) {
            throw new TypeError('Must specify an initialValue if the iterable is empty.');
        }
        return accumulator;
    }
    export function toArray<T>(this: Iterator<T>): Array<T> {
        const result: T[] = [];
        for (const x of this) {
            result.push(x);
        }
        return result;
    }
    export function forEach<T>(this: Iterator<T>, fn: (value: T, counter: number) => void): void {
        let counter = 0;
        for (const value of this) {
            fn(value, counter);
            counter++;
        }
    }
    export function some<T>(this: Iterator<T>, fn: (value: T, counter: number) => boolean): boolean {
        let counter = 0;
        for (const value of this) {
            if (fn(value, counter)) {
                return true;
            }
            counter++;
        }
        return false;
    }
    export function every<T>(this: Iterator<T>, fn: (value: T, counter: number) => boolean): boolean {
        let counter = 0;
        for (const value of this) {
            if (!fn(value, counter)) {
                return false;
            }
            counter++;
        }
        return true;
    }
    export function find<T>(this: Iterator<T>, fn: (value: T, counter: number) => boolean): undefined | T {
        let counter = 0;
        for (const value of this) {
            if (fn(value, counter)) {
                return value;
            }
            counter++;
        }
        return undefined;
    }
    export async function* toAsync<T>(this: Iterator<T>): AsyncIterator<T> { yield* this as any }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((function*(){}).prototype))} as any,IteratorPolyfill);

// Nonstandard shift()

declare interface Iterator<T, TReturn = any, TNext = undefined> {
    shift(): T | undefined;
    shift(n: number): IterableIterator<T | undefined>;
}

namespace IteratorShiftPolyfill {
    export function shift<T>(this: Iterator<T>): T | undefined;
    export function shift<T>(this: Iterator<T>, n: number): IterableIterator<T | undefined>;
    export function shift<T>(this: Iterator<T>, n?: number): T | undefined | IterableIterator<T | undefined> {
        if(n !== undefined) {
            return (function*(this: Iterator<T>) {
                for(let i = 0; i < n; i++) {
                    yield this.shift();
                }
            }).apply(this);
        }
        return this.next().value;
    }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((function*(){}).prototype))} as any,IteratorShiftPolyfill);