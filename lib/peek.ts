///#pragma once
type PeekableIterableIterator<T> = IterableIterator<T> & {
    peek: () => T | undefined;
    pop: () => T | undefined;
}

function createAsyncPeekableIterator<T>(asyncIterable: AsyncIterable<T>): PeekableAsyncIterableIterator<T> {
    let next = asyncIterable[Symbol.asyncIterator]().next();

    const it = (async function*() {
        let done: boolean | undefined = false, value;
        while(!done) {
            ({ done, value } = await next);

            if(!done) {
                next = asyncIterable[Symbol.asyncIterator]().next();
                yield value;
            }
        }
    })() as unknown as PeekableAsyncIterableIterator<T>;

    it.peek = async function peek() {
        return (await next).value;
    }
    it.pop = async function pop() {
        return (await it.next()).value;
    }

    return it;
}

type PeekableAsyncIterableIterator<T> = AsyncIterableIterator<T> & {
    peek: () => Promise<T | undefined>;
    pop: () => Promise<T | undefined>;
}

function createPeekableIterator<T>(iterable: Iterable<T>): PeekableIterableIterator<T> {
    let next = iterable[Symbol.iterator]().next();

    const it = (function*() {
        let done: boolean | undefined = false, value;
        while(!done) {
            ({ done, value } = next);

            if(!done) {
                next = iterable[Symbol.iterator]().next();
                yield value;
            }
        }
    })() as unknown as PeekableIterableIterator<T>;

    it.peek = function peek() {
        return next.value;
    }
    it.pop = function pop() {
        return it.next().value;
    }

    return it;
}