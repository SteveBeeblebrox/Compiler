///#pragma once

// For strings only, the upper bound is inclusive
type RangeT = number | bigint | char
function range<T extends RangeT>(max: T): IterableIterator<T>;
function range<T extends RangeT>(min: T, max: T, step?: T extends char ? number | char : T): IterableIterator<T>;
function* range(arg0: RangeT, arg1?: RangeT, arg2?: number | bigint): IterableIterator<RangeT> {
    function numerical(t: RangeT) {
        return typeof arg0 === 'bigint' ? BigInt(t) : t;
    }
    function destr(t?: RangeT) {
        return typeof t === 'string' ? t.charCodeAt(0) : t;
    }
    const [min,max] = (arg1 === undefined ? [numerical(0), destr(arg0)] : [destr(arg0), destr(arg1)]) as [number,number];
    const step = (destr(arg2) ?? numerical(1)) as number;
    let n = min;
    
    if(max < min) {
        throw new RangeError('Range min cannot be greater than max');
    }

    if(typeof arg0 === 'string') {
        while(n <= max) {
            yield String.fromCharCode(n) as char;
            n+=step;

        }
    } else {
        while(n < max) {
            yield n;
            n+=step;
        }
    }
}