///#pragma once
// AsyncIterator Polyfill based off of work by
// Axel Rauschmayer, (c) 2021 MIT License
// https://github.com/rauschma/iterator-helpers-polyfill
declare interface Iterator<T, TReturn = any, TNext = undefined> {
    toAsync(): AsyncIterator<T>;
}

declare interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
    next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;

    map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U>;
    filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T>;
    take(limit: number): AsyncIterator<T>;
    drop(limit: number): AsyncIterator<T>;
    flatMap<U>(
        mapper: (value: T, counter: number) => Iterable<U> | Iterator<U> | AsyncIterable<U> | AsyncIterator<U>
    ): AsyncIterator<U>;
    reduce<U>(
        reducer: (accumulator: U, value: T, counter: number) => U,
        initialValue?: U
    ): Promise<U>;
    toArray(): Promise<Array<T>>;
    forEach(fn: (value: T, counter: number) => void): Promise<void>;
    some(fn: (value: T, counter: number) => boolean): Promise<boolean>;
    every(fn: (value: T, counter: number) => boolean): Promise<boolean>;
    find(fn: (value: T, counter: number) => boolean): Promise<undefined | T>;
}
namespace AsyncIteratorPolyfill {
    const NO_INITIAL_VALUE = Symbol();
    export async function * map<T,U>(this: AsyncIterator<T>, mapper: (value: T, counter: number) => U): AsyncIterator < U > {
        let counter = 0;
        for await(const value of this) {
            yield mapper(value, counter);
            counter++;
        }
    }

    export async function* filter<T>(this: AsyncIterator<T>, filterer: (value: T, counter: number) => boolean): AsyncIterator<T> {
        let counter = 0;
        for await (const value of this) {
            if (filterer(value, counter)) {
                yield value;
            }
            counter++;
        }
    }

    export async function* take<T>(this: AsyncIterator<T>, limit: number): AsyncIterator<T> {
        let counter = 0;
        for await (const value of this) {
            if (counter >= limit) break;
            yield value;
            counter++;
        }
    }

    export async function* drop<T>(this: AsyncIterator<T>, limit: number): AsyncIterator<T> {
        let counter = 0;
        for await (const value of this) {
            if (counter >= limit) {
                yield value;
            }
            counter++;
        }
    }

    export async function* flatMap<T,U>(
        this: AsyncIterator<T>, mapper: (value: T, counter: number) => Iterable<U> | Iterator<U>
    ): AsyncIterator<U> {
        let counter = 0;
        for await (const value of this) {
            yield* mapper(value, counter);
            counter++;
        }
    }

    export async function reduce<T,U>(
        this: AsyncIterator<T>, 
        reducer: (accumulator: U, value: T, counter: number) => U,
        initialValue: typeof NO_INITIAL_VALUE | U = NO_INITIAL_VALUE
    ): Promise<U> {
        let accumulator = initialValue;
        let counter = 0;
        for await (const value of this) {
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
    export async function toArray<T>(this: AsyncIterator<T>): Promise<Array<T>> {
        const result: T[] = [];
        for await (const x of this) {
            result.push(x);
        }
        return result;
    }
    export async function forEach<T>(this: AsyncIterator<T>, fn: (value: T, counter: number) => void): Promise<void> {
        let counter = 0;
        for await (const value of this) {
            fn(value, counter);
            counter++;
        }
    }
    export async function some<T>(this: AsyncIterator<T>, fn: (value: T, counter: number) => boolean): Promise<boolean> {
        let counter = 0;
        for await (const value of this) {
            if (fn(value, counter)) {
                return true;
            }
            counter++;
        }
        return false;
    }
    export async function every<T>(this: AsyncIterator<T>, fn: (value: T, counter: number) => boolean): Promise<boolean> {
        let counter = 0;
        for await (const value of this) {
            if (!fn(value, counter)) {
                return false;
            }
            counter++;
        }
        return true;
    }
    export async function find<T>(this: AsyncIterator<T>, fn: (value: T, counter: number) => boolean): Promise<undefined | T> {
        let counter = 0;
        for await (const value of this) {
            if (fn(value, counter)) {
                return value;
            }
            counter++;
        }
        return undefined;
    }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((async function*(){}).prototype))} as any,AsyncIteratorPolyfill);

// Nonstandard shift()

declare interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    shift(): T | undefined;
}

namespace AsyncIteratorShiftPolyfill {
    export async function shift<T>(this: AsyncIterator<T>): Promise<T | undefined> {
        return (await this.next()).value;
    }
}

installPolyfill({prototype: Object.getPrototypeOf(Object.getPrototypeOf((async function*(){}).prototype))} as any,AsyncIteratorShiftPolyfill);