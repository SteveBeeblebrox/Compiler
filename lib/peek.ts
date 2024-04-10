///#pragma once
type PeekableIterableIterator<T> = IterableIterator<T> & {
    peek: () => T | undefined;
}

function createAsyncPeekableIterator<T>(asyncIterable: AsyncIterable<T>): PeekableAsyncIterableIterator<T> {
    let iter: AsyncIterator<T> = asyncIterable[Symbol.asyncIterator]();
    let next = iter.next();

    const it = (async function*() {
        let done: boolean | undefined = false, value;
        while(!done) {
            ({ done, value } = await next);

            if(!done) {
                next = iter.next();
                yield value;
            }
        }
    })() as unknown as PeekableAsyncIterableIterator<T>;

    it.peek = async function peek() {
        return (await next).value;
    }

    return it;
}

type PeekableAsyncIterableIterator<T> = AsyncIterableIterator<T> & {
    peek: () => Promise<T | undefined>;
}

function createPeekableIterator<T>(iterable: Iterable<T>): PeekableIterableIterator<T> {
    let iter: Iterator<T> = iterable[Symbol.iterator]();
    let next = iter.next();

    const it = (function*() {
        let done: boolean | undefined = false, value;
        while(!done) {
            ({ done, value } = next);

            if(!done) {
                next = iter.next();
                yield value;
            }
        }
    })() as unknown as PeekableIterableIterator<T>;

    it.peek = function peek() {
        return next.value;
    }

    return it;
}