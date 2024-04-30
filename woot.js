#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee woot.js) "$@"; exit $?
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _b, _c, _d, _e;
//@ts-nocheck
(function () {
    if (typeof globalThis === 'object')
        return;
    Object.defineProperty(Object.prototype, '__magic__', {
        get: function () {
            return this;
        },
        configurable: true
    });
    __magic__.globalThis = __magic__;
    delete Object.prototype.__magic__;
}());
//@ts-expect-error
(_a = Symbol['dispose']) !== null && _a !== void 0 ? _a : (Symbol['dispose'] = Symbol('dispose'));
//@ts-expect-error
(_b = Symbol['asyncDispose']) !== null && _b !== void 0 ? _b : (Symbol['asyncDispose'] = Symbol('asyncDispose'));
(_c = globalThis['system']) !== null && _c !== void 0 ? _c : (globalThis['system'] = {
    //@ts-expect-error
    args: process.argv.slice(1),
    //@ts-expect-error
    exit: process.exit,
    readTextFileSync(path) {
        //@ts-expect-error
        return require('fs').readFileSync(path, { encoding: 'utf8' });
    },
    writeTextFileSync(path, data) {
        //@ts-expect-error
        require('fs').writeFileSync(path, data, { encoding: 'utf8' });
    },
    readFileSync(path) {
        //@ts-expect-error
        return require('fs').readFileSync(path);
    },
    writeFileSync(path, data) {
        //@ts-expect-error
        require('fs').writeFileSync(path, data);
    },
    async createTextFileReadStream(path) {
        //@ts-expect-error
        const stream = require('fs').createReadStream(path, { encoding: 'utf8' });
        void await new Promise(function (resolve, reject) {
            stream.on('readable', resolve);
            stream.on('error', reject);
        });
        stream[Symbol.dispose] = () => { };
        return stream;
    },
    async createTextFileWriteStream(path) {
        //@ts-expect-error
        const stream = require('fs').createWriteStream(path, { encoding: 'utf8' });
        stream[Symbol.dispose] = () => { };
        return stream;
    }
});
(_d = system['createTextFileReadStream']) !== null && _d !== void 0 ? _d : (system['createTextFileReadStream'] = async function createTextFileReadStream(path) {
    //@ts-expect-error
    const file = system.openSync(path, { read: true });
    return {
        read(bytes) {
            const buf = new Uint8Array(bytes);
            file.readSync(buf);
            return new TextDecoder().decode(buf);
        },
        [Symbol.dispose]() {
            file.close();
        }
    };
});
(_e = system['createTextFileWriteStream']) !== null && _e !== void 0 ? _e : (system['createTextFileWriteStream'] = async function createTextFileWriteStream(path) {
    //@ts-expect-error
    const file = system.openSync(path, { write: true, create: true });
    return {
        write(text) {
            file.writeSync(new TextEncoder().encode(text));
        },
        [Symbol.dispose]() {
            file.close();
        }
    };
});
const throws = (e) => { throw e; };
function installPolyfill(base, pollyfill, debug = false) {
    for (const [name, func] of Object.entries(pollyfill)) {
        if (!(name in base.prototype)) {
            Object.defineProperty(base.prototype, name, { value: func, configurable: debug });
        }
    }
}
var ArrayPolyfill;
(function (ArrayPolyfill) {
    function at(index) {
        index *= 1;
        if (index >= 0) {
            return this[index];
        }
        else if (index < 0) {
            return this[this.length + index];
        }
        else {
            throw new TypeError(`Argument to at() is not a number`);
        }
    }
    ArrayPolyfill.at = at;
    function flat(depth = 1) {
        return depth ? Array.prototype.reduce.call(this, function (flattened, value) {
            if (Array.isArray(value)) {
                flattened.push.apply(flattened, flat.call(value, depth - 1));
            }
            else {
                flattened.push(value);
            }
            return flattened;
        }, []) : Array.prototype.slice.call(this);
    }
    ArrayPolyfill.flat = flat;
    function flatMap(callback, thisArg) {
        return Array.prototype.map.call(this, callback, thisArg).flat();
    }
    ArrayPolyfill.flatMap = flatMap;
})(ArrayPolyfill || (ArrayPolyfill = {}));
installPolyfill(Array, ArrayPolyfill);
var ArrayConstructorPolyfill;
(function (ArrayConstructorPolyfill) {
    function entries(arr) {
        return Array.prototype.map.apply(arr, [(t, i) => [i, t]]);
    }
    ArrayConstructorPolyfill.entries = entries;
})(ArrayConstructorPolyfill || (ArrayConstructorPolyfill = {}));
installPolyfill({ prototype: Array }, ArrayConstructorPolyfill);
var AsyncIteratorPolyfill;
(function (AsyncIteratorPolyfill) {
    const NO_INITIAL_VALUE = Symbol();
    async function* map(mapper) {
        let counter = 0;
        for await (const value of this) {
            yield mapper(value, counter);
            counter++;
        }
    }
    AsyncIteratorPolyfill.map = map;
    async function* filter(filterer) {
        let counter = 0;
        for await (const value of this) {
            if (filterer(value, counter)) {
                yield value;
            }
            counter++;
        }
    }
    AsyncIteratorPolyfill.filter = filter;
    async function* take(limit) {
        let counter = 0;
        for await (const value of this) {
            if (counter >= limit)
                break;
            yield value;
            counter++;
        }
    }
    AsyncIteratorPolyfill.take = take;
    async function* drop(limit) {
        let counter = 0;
        for await (const value of this) {
            if (counter >= limit) {
                yield value;
            }
            counter++;
        }
    }
    AsyncIteratorPolyfill.drop = drop;
    async function* flatMap(mapper) {
        let counter = 0;
        for await (const value of this) {
            yield* mapper(value, counter);
            counter++;
        }
    }
    AsyncIteratorPolyfill.flatMap = flatMap;
    async function reduce(reducer, initialValue = NO_INITIAL_VALUE) {
        let accumulator = initialValue;
        let counter = 0;
        for await (const value of this) {
            if (accumulator === NO_INITIAL_VALUE) {
                accumulator = value;
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
    AsyncIteratorPolyfill.reduce = reduce;
    async function toArray() {
        const result = [];
        for await (const x of this) {
            result.push(x);
        }
        return result;
    }
    AsyncIteratorPolyfill.toArray = toArray;
    async function forEach(fn) {
        let counter = 0;
        for await (const value of this) {
            fn(value, counter);
            counter++;
        }
    }
    AsyncIteratorPolyfill.forEach = forEach;
    async function some(fn) {
        let counter = 0;
        for await (const value of this) {
            if (fn(value, counter)) {
                return true;
            }
            counter++;
        }
        return false;
    }
    AsyncIteratorPolyfill.some = some;
    async function every(fn) {
        let counter = 0;
        for await (const value of this) {
            if (!fn(value, counter)) {
                return false;
            }
            counter++;
        }
        return true;
    }
    AsyncIteratorPolyfill.every = every;
    async function find(fn) {
        let counter = 0;
        for await (const value of this) {
            if (fn(value, counter)) {
                return value;
            }
            counter++;
        }
        return undefined;
    }
    AsyncIteratorPolyfill.find = find;
})(AsyncIteratorPolyfill || (AsyncIteratorPolyfill = {}));
installPolyfill({ prototype: Object.getPrototypeOf(Object.getPrototypeOf((async function* () { }).prototype)) }, AsyncIteratorPolyfill);
var AsyncIteratorShiftPolyfill;
(function (AsyncIteratorShiftPolyfill) {
    function shift(n) {
        if (n !== undefined) {
            return (async function* () {
                for (let i = 0; i < n; i++) {
                    yield this.shift();
                }
            }).apply(this);
        }
        return (async () => (await this.next()).value)();
    }
    AsyncIteratorShiftPolyfill.shift = shift;
})(AsyncIteratorShiftPolyfill || (AsyncIteratorShiftPolyfill = {}));
installPolyfill({ prototype: Object.getPrototypeOf(Object.getPrototypeOf((async function* () { }).prototype)) }, AsyncIteratorShiftPolyfill);
var IteratorPolyfill;
(function (IteratorPolyfill) {
    const NO_INITIAL_VALUE = Symbol();
    function* map(mapper) {
        let counter = 0;
        for (const value of this) {
            yield mapper(value, counter);
            counter++;
        }
    }
    IteratorPolyfill.map = map;
    function* filter(filterer) {
        let counter = 0;
        for (const value of this) {
            if (filterer(value, counter)) {
                yield value;
            }
            counter++;
        }
    }
    IteratorPolyfill.filter = filter;
    function* take(limit) {
        let counter = 0;
        for (const value of this) {
            if (counter >= limit)
                break;
            yield value;
            counter++;
        }
    }
    IteratorPolyfill.take = take;
    function* drop(limit) {
        let counter = 0;
        for (const value of this) {
            if (counter >= limit) {
                yield value;
            }
            counter++;
        }
    }
    IteratorPolyfill.drop = drop;
    function* flatMap(mapper) {
        let counter = 0;
        for (const value of this) {
            yield* mapper(value, counter);
            counter++;
        }
    }
    IteratorPolyfill.flatMap = flatMap;
    function reduce(reducer, initialValue = NO_INITIAL_VALUE) {
        let accumulator = initialValue;
        let counter = 0;
        for (const value of this) {
            if (accumulator === NO_INITIAL_VALUE) {
                accumulator = value;
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
    IteratorPolyfill.reduce = reduce;
    function toArray() {
        const result = [];
        for (const x of this) {
            result.push(x);
        }
        return result;
    }
    IteratorPolyfill.toArray = toArray;
    function forEach(fn) {
        let counter = 0;
        for (const value of this) {
            fn(value, counter);
            counter++;
        }
    }
    IteratorPolyfill.forEach = forEach;
    function some(fn) {
        let counter = 0;
        for (const value of this) {
            if (fn(value, counter)) {
                return true;
            }
            counter++;
        }
        return false;
    }
    IteratorPolyfill.some = some;
    function every(fn) {
        let counter = 0;
        for (const value of this) {
            if (!fn(value, counter)) {
                return false;
            }
            counter++;
        }
        return true;
    }
    IteratorPolyfill.every = every;
    function find(fn) {
        let counter = 0;
        for (const value of this) {
            if (fn(value, counter)) {
                return value;
            }
            counter++;
        }
        return undefined;
    }
    IteratorPolyfill.find = find;
    async function* toAsync() { yield* this; }
    IteratorPolyfill.toAsync = toAsync;
})(IteratorPolyfill || (IteratorPolyfill = {}));
installPolyfill({ prototype: Object.getPrototypeOf(Object.getPrototypeOf((function* () { }).prototype)) }, IteratorPolyfill);
var IteratorShiftPolyfill;
(function (IteratorShiftPolyfill) {
    function shift(n) {
        if (n !== undefined) {
            return (function* () {
                for (let i = 0; i < n; i++) {
                    yield this.shift();
                }
            }).apply(this);
        }
        return this.next().value;
    }
    IteratorShiftPolyfill.shift = shift;
})(IteratorShiftPolyfill || (IteratorShiftPolyfill = {}));
installPolyfill({ prototype: Object.getPrototypeOf(Object.getPrototypeOf((function* () { }).prototype)) }, IteratorShiftPolyfill);
var ObjectPolyfill;
(function (ObjectPolyfill) {
    void 0;
})(ObjectPolyfill || (ObjectPolyfill = {}));
installPolyfill(Object, ObjectPolyfill);
var ObjectConstructorPolyfill;
(function (ObjectConstructorPolyfill) {
    function groupBy(values, callback) {
        return values.reduce((obj, value, index) => {
            var _a;
            const key = callback(value, index);
            obj[key] = [...((_a = obj[key]) !== null && _a !== void 0 ? _a : []), value];
            return obj;
        }, {});
    }
    ObjectConstructorPolyfill.groupBy = groupBy;
    function hasOwn(o, v) {
        return Object.prototype.hasOwnProperty.call(o, v);
    }
    ObjectConstructorPolyfill.hasOwn = hasOwn;
})(ObjectConstructorPolyfill || (ObjectConstructorPolyfill = {}));
installPolyfill({ prototype: Object }, ObjectConstructorPolyfill);
// Set Polyfill based off of work by
// Axel Rauschmayer, (c) 2021 MIT License
// https://github.com/rauschma/set-methods-polyfill
var SetPolyfill;
(function (SetPolyfill) {
    function union(other) {
        validateOther(other);
        const result = new this.constructor(this);
        for (const elem of other.keys()) {
            result.add(elem);
        }
        return result;
    }
    SetPolyfill.union = union;
    function intersection(other) {
        validateOther(other);
        let smallerElems;
        let largerHas;
        if (this.size <= other.size) {
            smallerElems = this;
            largerHas = other;
        }
        else {
            smallerElems = other.keys();
            largerHas = this;
        }
        const result = new this.constructor();
        for (const elem of smallerElems) {
            if (largerHas.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    }
    SetPolyfill.intersection = intersection;
    function difference(other) {
        validateOther(other);
        const result = new this.constructor(this);
        if (this.size <= other.size) {
            for (const elem of this) {
                if (other.has(elem)) {
                    result.delete(elem);
                }
            }
        }
        else {
            for (const elem of other.keys()) {
                if (result.has(elem)) {
                    result.delete(elem);
                }
            }
        }
        return result;
    }
    SetPolyfill.difference = difference;
    function symmetricDifference(other) {
        validateOther(other);
        const result = new this.constructor(this);
        for (const elem of other.keys()) {
            if (this.has(elem)) {
                result.delete(elem);
            }
            else {
                result.add(elem);
            }
        }
        return result;
    }
    SetPolyfill.symmetricDifference = symmetricDifference;
    function isSubsetOf(other) {
        validateOther(other);
        for (const elem of this) {
            if (!other.has(elem))
                return false;
        }
        return true;
    }
    SetPolyfill.isSubsetOf = isSubsetOf;
    function isSupersetOf(other) {
        validateOther(other);
        for (const elem of other.keys()) {
            if (!this.has(elem))
                return false;
        }
        return true;
    }
    SetPolyfill.isSupersetOf = isSupersetOf;
    function isDisjointFrom(other) {
        validateOther(other);
        if (this.size <= other.size) {
            for (const elem of this) {
                if (other.has(elem))
                    return false;
            }
        }
        else {
            for (const elem of other.keys()) {
                if (this.has(elem))
                    return false;
            }
        }
        return true;
    }
    SetPolyfill.isDisjointFrom = isDisjointFrom;
    function validateOther(obj) {
        function isObject(value) {
            if (value === null)
                return false;
            const t = typeof value;
            return t === 'object' || t === 'function';
        }
        if (!isObject(obj)) {
            throw new TypeError();
        }
        const rawSize = obj.size;
        const numSize = Number(rawSize);
        if (Number.isNaN(numSize)) {
            throw new TypeError();
        }
        const has = obj.has;
        if (typeof has !== 'function') {
            throw new TypeError();
        }
        const keys = obj.keys;
        if (typeof keys !== 'function') {
            throw new TypeError();
        }
    }
})(SetPolyfill || (SetPolyfill = {}));
installPolyfill(Set, SetPolyfill);
// Nonstandard in-place set methods
// Don't use these while iterating the set
var InPlaceSetPolyfill;
(function (InPlaceSetPolyfill) {
    function takeInPlace(f) {
        return function (other) {
            const result = f.bind(this)(other);
            this.clear();
            result.forEach(t => this.add(t));
            return this;
        };
    }
    InPlaceSetPolyfill.takeUnion = takeInPlace(SetPolyfill.union);
    InPlaceSetPolyfill.takeIntersection = takeInPlace(SetPolyfill.intersection);
    InPlaceSetPolyfill.takeDifference = takeInPlace(SetPolyfill.difference);
    InPlaceSetPolyfill.takeSymmetricDifference = takeInPlace(SetPolyfill.symmetricDifference);
})(InPlaceSetPolyfill || (InPlaceSetPolyfill = {}));
installPolyfill(Set, InPlaceSetPolyfill);
// TextDecoder Polyfill based off of work by
// anonyco, CC0-1.0
// https://github.com/anonyco/FastestSmallestTextEncoderDecoder
// This doesn't support all the features of the standard TextDecoder,
// but it is good enough for loading embed directives
class BasicTextDecoder {
    decode(buffer) {
        let result = '';
        for (let i = 0; i < buffer.length; i += 32768) {
            result += String.fromCharCode(...buffer.subarray(i, i + 32768));
        }
        return result.replace(/[\xc0-\xff][\x80-\xbf]+|[\x80-\xff]/g, function (encoded) {
            const cp0 = encoded.charCodeAt(0);
            let codePoint = 0x110000, i = 0, result = "";
            switch (cp0 >>> 4) {
                // no 1 byte sequences
                case 12:
                case 13:
                    codePoint = ((cp0 & 0x1F) << 6) | (encoded.charCodeAt(1) & 0x3F);
                    i = codePoint < 0x80 ? 0 : 2;
                    break;
                case 14:
                    codePoint = ((cp0 & 0x0F) << 12) | ((encoded.charCodeAt(1) & 0x3F) << 6) | (encoded.charCodeAt(2) & 0x3F);
                    i = codePoint < 0x800 ? 0 : 3;
                    break;
                case 15:
                    if ((cp0 >>> 3) === 30) {
                        codePoint = ((cp0 & 0x07) << 18) | ((encoded.charCodeAt(1) & 0x3F) << 12) | ((encoded.charCodeAt(2) & 0x3F) << 6) | encoded.charCodeAt(3);
                        i = codePoint < 0x10000 ? 0 : 4;
                    }
            }
            if (i) {
                if (encoded.length < i) {
                    i = 0;
                }
                else if (codePoint < 0x10000) { // BMP code point
                    result = String.fromCharCode(codePoint);
                }
                else if (codePoint < 0x110000) {
                    codePoint = codePoint - 0x10080; //- 0x10000|0;
                    result = String.fromCharCode((codePoint >>> 10) + 0xD800, // highSurrogate
                    (codePoint & 0x3ff) + 0xDC00 // lowSurrogate
                    );
                }
                else {
                    i = 0; // to fill it in with INVALIDs
                }
            }
            for (; i < encoded.length; i++)
                result += "\ufffd"; // fill rest with replacement character
            return result;
        });
    }
}
class Token {
    constructor(name, value, pos) {
        this.name = name;
        this.value = value;
        this.pos = pos;
    }
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}
class CFG {
    constructor(startingSymbol, rules, terminals) {
        this.startingSymbol = startingSymbol;
        this.rules = rules;
        this.terminals = terminals;
    }
    getTerminals() {
        return [...this.terminals];
    }
    getTerminalsAndEOF() {
        return [...this.terminals, CFG.EOF];
    }
    getNonTerminals() {
        return [...new Set(this.rules.keys())];
    }
    getGrammarSymbols() {
        return [CFG.EOF, ...this.getTerminals(), ...this.getNonTerminals()];
    }
    isStartingRule(rule) {
        if (typeof rule !== 'string')
            return this.isStartingRule(rule[0]);
        return rule === this.startingSymbol;
    }
    static isTerminal(string) {
        return !this.isEOF(string) && !this.isLambda(string) && string.toLowerCase() === string && string.length >= 1;
    }
    static isTerminalOrEOF(string) {
        return CFG.isEOF(string) || CFG.isTerminal(string);
    }
    static isEOF(string) {
        return string === CFG.EOF;
    }
    static isLambda(string) {
        return string === CFG.LAMBDA_CHARACTER;
    }
    static isNonTerminal(arg) {
        return typeof arg === 'string' && !this.isEOF(arg) && !this.isLambda(arg) && arg.toLowerCase() !== arg && arg.length >= 1;
    }
    derivesToLambda(L, T = []) {
        var _a;
        const P = this.rules;
        for (const p of ((_a = P.get(L)) !== null && _a !== void 0 ? _a : [])) {
            if ([...T].includes(p)) {
                continue;
            }
            if (!p.length) {
                return true;
            }
            if (p.some(x => CFG.isTerminal(x))) {
                continue;
            }
            let adl = true;
            for (const X of p.filter(x => CFG.isNonTerminal(x))) {
                T.push(p);
                adl = this.derivesToLambda(X, T);
                T.pop();
                if (!adl) {
                    break;
                }
            }
            if (adl) {
                return true;
            }
        }
        return false;
    }
    firstSet([X, ...B], T = new Set()) {
        var _a;
        const P = this.rules;
        if (X === undefined) {
            return [new Set(), T];
        }
        if (CFG.isTerminalOrEOF(X)) {
            return [new Set([X]), T];
        }
        const F = new Set();
        if (!T.has(X)) {
            T.add(X);
            for (const p of ((_a = P.get(X)) !== null && _a !== void 0 ? _a : []).map(x => [X, x])) {
                const [lhs, rhs] = p;
                const [G, I] = this.firstSet(this.startingSymbol === X ? [...rhs, CFG.EOF] : rhs, T);
                F.takeUnion(G);
            }
        }
        if (this.derivesToLambda(X) && B.length) {
            const [G, I] = this.firstSet(B, T);
            F.takeUnion(G);
        }
        return [F, T];
    }
    followSet(A, T = new Set()) {
        const followSet = (function (A, T = new Set()) {
            const P = this.rules;
            if (T.has(A)) {
                return [new Set(), T];
            }
            T.add(A);
            const F = new Set();
            for (const p of [...P.entries()].flatMap(([sym, rs]) => rs.flatMap(rule => rule.includes(A) ? [[sym, rule]] : []))) {
                const [lhs, rhs] = p;
                for (const [i, gamma] of [...rhs.entries()].filter(([_, x]) => x === A)) {
                    const pi = rhs.slice(i + 1);
                    if (pi.length) {
                        const [G, I] = this.firstSet(pi, new Set());
                        F.takeUnion(G);
                    }
                    if (!pi.length || (pi.every(x => CFG.isNonTerminal(x) && this.derivesToLambda(x)))) {
                        if (this.isStartingRule(lhs)) {
                            F.add(CFG.EOF);
                        }
                        const [G, I] = followSet(lhs, T);
                        F.takeUnion(G);
                    }
                }
            }
            return [F, T];
        }).bind(this);
        return followSet(A, T)[0];
    }
    predictSet([lhs, rhs]) {
        const F = this.firstSet(rhs)[0];
        if (rhs.every(x => this.derivesToLambda(x))) {
            [...this.followSet(lhs).values()].forEach(x => F.add(x));
        }
        return F;
    }
    getRuleList() {
        return this.rules.entries().flatMap(([lhs, rules]) => rules.flatMap(rhs => [[lhs, rhs]])).toArray();
    }
    getRuleListFor(lhs) {
        return this.rules.get(lhs).map(rhs => [lhs, rhs]);
    }
    static makeUniqueNonTerminal(cfg, name, suffix = '\'') {
        // @ts-expect-error
        while (cfg.getNonTerminals().includes(name))
            name += suffix;
        return name;
    }
    stringifyRule(rule, lhs = true) {
        if (lhs)
            return `${rule[0]} -> ${this.stringifyRule(rule, false)}`;
        else
            return (rule[1].length ? rule[1].join(' ') : CFG.LAMBDA_CHARACTER) + (this.isStartingRule(rule) ? ' ' + CFG.EOF_CHARACTER : '');
    }
    stringifySet(set) {
        return `{${set.values().map(c => c === CFG.EOF
            ? CFG.EOF_CHARACTER
            : `'${JSON.stringify(c).slice(1, -1).replace(/'/g, '\\\'').replace(/\\"/g, '"')}'`).toArray().join(', ')}}`;
    }
    getRuleNumber(rule) {
        if (this.isStartingRule(rule[0])) {
            rule = [rule[0], rule[1].filter(x => x !== CFG.EOF)];
        }
        return this.getRuleList().findIndex(([lhs, rhs]) => rule[0] === lhs && rule[1].length === rhs.length && rule[1].every((p, i) => p === rhs[i]));
    }
    static fromString(text, allowComments = true) {
        var _a;
        const cfgKeywords = Object.assign(Object.create(null), {
            ARROW: '->',
            UC_LAMBDA: CFG.LAMBDA_CHARACTER,
            LAMBDA: 'lambda',
            OR: '|',
            EOF: CFG.EOF_CHARACTER
        });
        const tokens = [];
        for (const line of text.split('\n').map(x => x.trim())) {
            if (line.startsWith('#') && allowComments)
                continue;
            tokens.push(...line.split(' ').filter(x => x));
        }
        const rules = new Map();
        let startingSymbol = null;
        const terminals = new Set();
        while (tokens.length) {
            const target = tokens.shift();
            if (tokens.shift() !== cfgKeywords.ARROW)
                throw new Error(`Expected '${cfgKeywords.ARROW}' after '${target}'!`);
            rules.set(target, (_a = rules.get(target)) !== null && _a !== void 0 ? _a : []);
            const ruleSet = rules.get(target);
            let currentRule;
            ruleSet.push(currentRule = []);
            while (tokens[1] !== cfgKeywords.ARROW && tokens.length) {
                const token = tokens.shift();
                switch (token) {
                    case cfgKeywords.LAMBDA:
                    case cfgKeywords.UC_LAMBDA:
                        break;
                    case cfgKeywords.EOF:
                        if (startingSymbol === null)
                            startingSymbol = target;
                        else if (startingSymbol !== target)
                            throw new Error(`Multiple starting rules containing '${cfgKeywords.EOF}' found!`);
                        break;
                    case cfgKeywords.OR:
                        ruleSet.push(currentRule = []);
                        break;
                    default:
                        if (CFG.isTerminal(token))
                            terminals.add(token);
                        currentRule.push(token);
                        break;
                }
            }
        }
        if (startingSymbol === null)
            throw new Error(`No starting rule containing '${cfgKeywords.EOF}' found!`);
        return new CFG(startingSymbol, rules, terminals);
    }
    cfsm() {
        return new SLR1.CFSM(this);
    }
}
CFG.EOF = undefined;
CFG.EOF_CHARACTER = '$';
CFG.LAMBDA_CHARACTER = '\u03bb';
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?
/*
 * LZ Compression
 * (c) 2013 Pieroxy - WTFPLv2
 * Adapted for TypeScript
 * https://pieroxy.net/blog/pages/lz-string/index.html
 */
var LZCompression;
(function (LZCompression) {
    // private property
    const f = String.fromCharCode;
    const keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';
    const baseReverseDic = {};
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (let i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }
    function compressToBase64(input) {
        if (input == null)
            return '';
        const res = _compress(input, 6, function (a) { return keyStrBase64.charAt(a); });
        switch (res.length % 4) { // To produce valid Base64
            default: // When could this happen ?
            case 0: return res;
            case 1: return res + '===';
            case 2: return res + '==';
            case 3: return res + '=';
        }
    }
    LZCompression.compressToBase64 = compressToBase64;
    function decompressFromBase64(input) {
        if (input == null)
            return '';
        if (input == '')
            return null;
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
    }
    LZCompression.decompressFromBase64 = decompressFromBase64;
    function compressToUTF16(input) {
        if (input == null)
            return '';
        return _compress(input, 15, function (a) { return f(a + 32); }) + ' ';
    }
    LZCompression.compressToUTF16 = compressToUTF16;
    function decompressFromUTF16(compressed) {
        if (compressed == null)
            return '';
        if (compressed == '')
            return null;
        return _decompress(compressed.length, 16384, function (index) { return compressed.charCodeAt(index) - 32; });
    }
    LZCompression.decompressFromUTF16 = decompressFromUTF16;
    //compress into uint8array (UCS-2 big endian format)
    function compressToUint8Array(uncompressed) {
        const compressed = compress(uncompressed);
        const buf = new Uint8Array(compressed.length * 2); // 2 bytes per character
        for (let i = 0, totalLen = compressed.length; i < totalLen; i++) {
            const current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
        }
        return buf;
    }
    LZCompression.compressToUint8Array = compressToUint8Array;
    //decompress from uint8array (UCS-2 big endian format)
    function decompressFromUint8Array(compressed) {
        if (compressed === null || compressed === undefined) {
            return decompress(compressed);
        }
        else {
            const buf = new Array(compressed.length / 2); // 2 bytes per character
            for (let i = 0, totalLen = buf.length; i < totalLen; i++) {
                buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }
            const result = [];
            buf.forEach(function (c) {
                result.push(f(c));
            });
            return decompress(result.join(''));
        }
    }
    LZCompression.decompressFromUint8Array = decompressFromUint8Array;
    //compress into a string that is already URI encoded
    function compressToEncodedURIComponent(input) {
        if (input == null)
            return '';
        return _compress(input, 6, function (a) { return keyStrUriSafe.charAt(a); });
    }
    LZCompression.compressToEncodedURIComponent = compressToEncodedURIComponent;
    //decompress from an output of compressToEncodedURIComponent
    function decompressFromEncodedURIComponent(input) {
        if (input == null)
            return '';
        if (input == '')
            return null;
        input = input.replace(/ /g, '+');
        return _decompress(input.length, 32, function (index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
    }
    LZCompression.decompressFromEncodedURIComponent = decompressFromEncodedURIComponent;
    function compress(uncompressed) {
        return _compress(uncompressed, 16, function (a) { return f(a); });
    }
    LZCompression.compress = compress;
    function _compress(uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null)
            return '';
        let i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = '', context_wc = '', context_w = '', context_enlargeIn = 2, // Compensate for the first entry which should not count
        context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0;
        for (let ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            }
            else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            }
                            else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                }
                else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                // Add wc to the dictionary.
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }
        // Output the code for w.
        if (context_w !== '') {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        }
                        else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            }
            else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    }
                    else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }
        // Mark the end of the stream
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            }
            else {
                context_data_position++;
            }
            value = value >> 1;
        }
        // Flush the last char
        while (true) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            }
            else
                context_data_position++;
        }
        return context_data.join('');
    }
    function decompress(compressed) {
        if (compressed == null)
            return '';
        if (compressed == '')
            return null;
        return _decompress(compressed.length, 32768, function (index) { return compressed.charCodeAt(index); });
    }
    LZCompression.decompress = decompress;
    function _decompress(length, resetValue, getNextValue) {
        let dictionary = [], next, enlargeIn = 4, dictSize = 4, numBits = 3, entry = '', result = [], i, w, bits, resb, maxpower, power, c, data = { val: getNextValue(0), position: resetValue, index: 1 };
        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        switch (next = bits) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = f(bits);
                break;
            case 2:
                return '';
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
            if (data.index > length) {
                return '';
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch (c = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = f(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 2:
                    return result.join('');
            }
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            if (dictionary[c]) {
                entry = dictionary[c];
            }
            else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                }
                else {
                    return null;
                }
            }
            result.push(entry);
            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            w = entry;
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
        }
    }
    LZCompression.zip = compress;
    LZCompression.unzip = decompress;
})(LZCompression || (LZCompression = {}));
/**
 * Do NOT put mutable items in a set or use them as map keys! Bad things will happen.
 */
var Signature;
(function (Signature) {
    // Prepopulate with well known symbols
    const symbolSet = new Set(Object.keys(Object.getOwnPropertyDescriptors(Symbol)).flatMap(function (key) {
        const value = Symbol[key];
        if (typeof value === 'symbol' && value !== Symbol.for(value.toString().slice(7, -1))) {
            return [value];
        }
        else {
            return [];
        }
    }));
    Signature.toSignable = Symbol('Signature.toSignable');
    function create(value, options = {}) {
        function createSignature(value, options = {}) {
            var _a;
            const references = new Map();
            function getSymbolEntries(obj) {
                return Object.getOwnPropertySymbols(obj).map(sym => [sym, obj[sym]]);
            }
            function transform(value, path, options) {
                try {
                    if ((typeof value === 'object' && value !== null) || (typeof value === 'function' && options.includeFunctions && options.preserveReferences)) {
                        if (references.has(value)) {
                            return `@&:${createSignature(references.get(value), { ...options, space: 0 })}`;
                        }
                        else {
                            references.set(value, path);
                        }
                    }
                    if (Array.isArray(value)) {
                        return value.filter(value => typeof value !== 'function' || options.includeFunctions).map((value, index) => transform(value, [...path, `${index}`], options));
                    }
                    else if (typeof value === 'object' && value !== null) {
                        if (Signature.toSignable in value)
                            return `@${Object.getPrototypeOf(value).constructor.name}:${createSignature(value[Signature.toSignable](options, value => transform(value, [...path], { ...options, space: 0 })), { ...options, space: 0 })}`;
                        const entries = [...getSymbolEntries(value), ...Object.entries(value)].map(([key, value]) => [transform(key, [...path, key], options), transform(value, [...path, key], options)]);
                        return Object.fromEntries((options === null || options === void 0 ? void 0 : options.sortKeys) ? entries.sort() : entries);
                    }
                    else if (typeof value === 'bigint') {
                        return `@bigint:${createSignature(value.toString())}`;
                    }
                    else if (typeof value === 'symbol') {
                        const name = value.toString().slice(7, -1);
                        symbolSet.add(value);
                        return `@symbol:${createSignature([name, Symbol.for(name) === value ? -1 : [...symbolSet.values()].indexOf(value)])}`;
                    }
                    else if (typeof value === 'string') {
                        return value.replace(/@/g, '@@');
                    }
                    else if (Number.isNaN(value)) {
                        return '@number:NaN';
                    }
                    else if (value === Infinity) {
                        return '@number:+Infinity';
                    }
                    else if (value === -Infinity) {
                        return '@number:-Infinity';
                    }
                    else if (typeof value === 'undefined') {
                        return '@undefined';
                    }
                    else if (typeof value === 'function') {
                        return options.includeFunctions ? `@function:${value}` : void (0);
                    }
                    else {
                        return value;
                    }
                }
                finally {
                    if (typeof value === 'object' && value !== null && !options.preserveReferences) {
                        references.delete(value);
                    }
                }
            }
            return JSON.stringify(transform(value, [], options), undefined, Math.max((_a = options === null || options === void 0 ? void 0 : options.space) !== null && _a !== void 0 ? _a : 0, 0));
        }
        const signature = createSignature(value, { sortKeys: true, includeFunctions: true, preserveReferences: false, ...options });
        return options.space === -1 || options.space === undefined ? LZCompression.zip(signature) : signature;
    }
    Signature.create = create;
    class SignatureMap {
        constructor(iterable) {
            this.base = new Map();
            for (const [k, v] of iterable !== null && iterable !== void 0 ? iterable : []) {
                this.set(k, v);
            }
        }
        clear() {
            return this.base.clear();
        }
        delete(key) {
            return this.base.delete(Signature.create(key));
        }
        forEach(callbackfn, thisArg) {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return [...this.base.values()].forEach(([k, v]) => callbackfn(v, k, this));
        }
        get(key) {
            var _a;
            return (_a = this.base.get(Signature.create(key))) === null || _a === void 0 ? void 0 : _a[1];
        }
        has(key) {
            return this.base.has(Signature.create(key));
        }
        set(key, value) {
            this.base.set(Signature.create(key), [key, value]);
            return this;
        }
        get size() {
            return this.base.size;
        }
        entries() {
            return this.base.values();
        }
        keys() {
            return [...this.base.values()].map(([k, v]) => k)[Symbol.iterator]();
        }
        values() {
            return [...this.base.values()].map(([k, v]) => v)[Symbol.iterator]();
        }
        [Symbol.iterator]() {
            return this.base.values();
        }
        get [Symbol.toStringTag]() {
            return 'SignatureMap';
        }
        [Signature.toSignable](options, transform) {
            return (options.sortKeys ? [...this.entries()].map(transform).sort() : [...this.entries()]);
        }
    }
    Signature.SignatureMap = SignatureMap;
    class SignatureSet {
        constructor(iterable) {
            this.base = new Map();
            for (const t of iterable !== null && iterable !== void 0 ? iterable : []) {
                this.add(t);
            }
        }
        add(value) {
            this.base.set(Signature.create(value), value);
            return this;
        }
        clear() {
            return this.base.clear();
        }
        delete(value) {
            return this.base.delete(Signature.create(value));
        }
        // Different callback than pollyfill
        // @ts-expect-error
        forEach(callbackfn, thisArg) {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return [...this.base.values()].forEach(t => callbackfn(t, t, this));
        }
        has(value) {
            return this.base.has(Signature.create(value));
        }
        get size() {
            return this.base.size;
        }
        entries() {
            return [...this.base.values()].map(t => [t, t])[Symbol.iterator]();
        }
        keys() {
            return this.base.values();
        }
        values() {
            return this.base.values();
        }
        [Symbol.iterator]() {
            return this.base.values();
        }
        get [Symbol.toStringTag]() {
            return 'SignatureSet';
        }
        [Signature.toSignable](options, transform) {
            return (options.sortKeys ? [...this.values()].map(transform).sort() : [...this.values()]);
        }
    }
    Signature.SignatureSet = SignatureSet;
})(Signature || (Signature = {}));
var SignatureSet = Signature.SignatureSet;
var SignatureMap = Signature.SignatureMap;
Set.prototype[Signature.toSignable] = function (options, transform) {
    return (options.sortKeys ? [...this.values()].map(transform).sort() : [...this.values()]);
};
Map.prototype[Signature.toSignable] = function (options, transform) {
    return (options.sortKeys ? [...this.entries()].map(transform).sort() : [...this.entries()]);
};
Date.prototype[Signature.toSignable] = function () {
    return this.toJSON();
};
Number.prototype[Signature.toSignable] = function () {
    return this.valueOf();
};
Boolean.prototype[Signature.toSignable] = function () {
    return this.valueOf();
};
String.prototype[Signature.toSignable] = function () {
    return this.toString();
};
RegExp.prototype[Signature.toSignable] = function () {
    return this.toString();
};
// The pollyfill is typed with this: Set<T> but will also work for this: SignatureSet<T>
//@ts-expect-error
installPolyfill(SignatureSet, SetPolyfill);
//@ts-expect-error
installPolyfill(SignatureSet, InPlaceSetPolyfill);
var AlphabetEncoding;
(function (AlphabetEncoding) {
    function decode(encoded) {
        function unescape(sequence) {
            const n = +`0${sequence}`;
            if (Number.isNaN(n))
                throw new Error(`'${sequence}' is not a valid escape sequence!`);
            return String.fromCharCode(n);
        }
        return encoded === null || encoded === void 0 ? void 0 : encoded.replace(/x.{0,2}/g, unescape);
    }
    AlphabetEncoding.decode = decode;
    function encode(text, force = false) {
        function escape(char) {
            return `x${char.charCodeAt(0).toString(16).padStart(2, '0')}`;
        }
        return force ? text[Symbol.iterator]().map(escape).toArray().join('') : text === null || text === void 0 ? void 0 : text.replace(/[^0-9A-Za-wy-z]/g, escape);
    }
    AlphabetEncoding.encode = encode;
})(AlphabetEncoding || (AlphabetEncoding = {}));
const { decode: alphaDecode, encode: alphaEncode } = AlphabetEncoding;
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?
var DecoratorFactory;
(function (DecoratorFactory) {
    DecoratorFactory.addLazyDecoratorSymbol = Symbol('addLazyDecorator');
    function isDecoratorContext(arg) {
        return typeof arg === 'object' && arg !== null && ['kind', 'name'].every(key => Object.hasOwn(arg, key));
    }
    function isFactoryCall(...args) {
        return !((typeof args[0] === 'function' || typeof args[0] === 'undefined') && isDecoratorContext(args[1]));
    }
    function invokeDefault(value, context, ...args) {
        return context.kind === 'class' ? new value(...args) : value(...args);
    }
    DecoratorFactory.invokeDefault = invokeDefault;
    function decorator(f) {
        function decorate(...args) {
            if (isFactoryCall(...args)) {
                return (value, context) => (value === null || value === void 0 ? void 0 : value[DecoratorFactory.addLazyDecoratorSymbol]) ? void value[DecoratorFactory.addLazyDecoratorSymbol](f, args) : f(value, context, ...args);
            }
            else {
                const [value, context] = args;
                return (value === null || value === void 0 ? void 0 : value[DecoratorFactory.addLazyDecoratorSymbol]) ? void value[DecoratorFactory.addLazyDecoratorSymbol](f, []) : f(value, context, ...[]);
            }
        }
        return decorate;
    }
    DecoratorFactory.decorator = decorator;
    function getPropertyDescriptor(o, p) {
        var _a;
        if (o == null) {
            return undefined;
        }
        return (_a = Object.getOwnPropertyDescriptor(o, p)) !== null && _a !== void 0 ? _a : getPropertyDescriptor(Object.getPrototypeOf(o), p);
    }
    DecoratorFactory.getPropertyDescriptor = getPropertyDescriptor;
})(DecoratorFactory || (DecoratorFactory = {}));
const enumerable = DecoratorFactory.decorator((_, context, enumerable = true) => context.addInitializer(function () {
    Object.defineProperty(this, context.name, { ...DecoratorFactory.getPropertyDescriptor(this, context.name), enumerable });
}));
var Trees;
(function (Trees) {
    var _Tree_instances, _Tree_children, _Tree_parent, _Tree_disown, _Tree_own;
    class TreeInternals {
    }
    TreeInternals.treeLength = Symbol('Tree.treeLength');
    TreeInternals.values = Symbol('Tree.values');
    TreeInternals.at = Symbol('Tree.at');
    TreeInternals.push = Symbol('Tree.push');
    TreeInternals.unshift = Symbol('Tree.unshift');
    TreeInternals.pop = Symbol('Tree.pop');
    TreeInternals.shift = Symbol('Tree.shift');
    TreeInternals.splice = Symbol('Tree.splice');
    TreeInternals.iterator = Symbol('Tree.iterator');
    TreeInternals.forEach = Symbol('Tree.forEach');
    class Tree extends TreeInternals {
        constructor() {
            super(...arguments);
            _Tree_instances.add(this);
            _Tree_children.set(this, []);
            _Tree_parent.set(this, undefined);
        }
        get parent() {
            return __classPrivateFieldGet(this, _Tree_parent, "f");
        }
        [(_Tree_children = new WeakMap(), _Tree_parent = new WeakMap(), _Tree_instances = new WeakSet(), _Tree_disown = function _Tree_disown(other) {
            if (other !== undefined) {
                __classPrivateFieldSet(other, _Tree_parent, undefined, "f");
            }
            return other;
        }, _Tree_own = function _Tree_own(other) {
            if (other === undefined) {
                throw new Error('Cannot take ownership of undefined');
            }
            if (other === this) {
                throw new Error('Cannot take ownership of self');
            }
            if (other.parent !== undefined) {
                throw new Error('Cannot take ownership of a subtree');
            }
            let ancestor = this;
            do {
                if (ancestor === other) {
                    throw new Error('Cannot take ownership of ancestor');
                }
            } while (ancestor = ancestor.parent);
            __classPrivateFieldSet(other, _Tree_parent, this, "f");
            return other;
        }, TreeInternals.push)](...items) {
            return __classPrivateFieldGet(this, _Tree_children, "f").push(...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree)));
        }
        [TreeInternals.pop]() {
            return __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, __classPrivateFieldGet(this, _Tree_children, "f").pop());
        }
        [TreeInternals.unshift](...items) {
            return __classPrivateFieldGet(this, _Tree_children, "f").unshift(...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree)));
        }
        [TreeInternals.shift]() {
            return __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, __classPrivateFieldGet(this, _Tree_children, "f").shift());
        }
        [TreeInternals.splice](start, deleteCount, ...items) {
            return __classPrivateFieldGet(this, _Tree_children, "f").splice(start, deleteCount, ...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree))).map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, tree));
        }
        [TreeInternals.at](index) {
            return __classPrivateFieldGet(this, _Tree_children, "f").at(index);
        }
        get [TreeInternals.treeLength]() {
            return __classPrivateFieldGet(this, _Tree_children, "f").length;
        }
        [TreeInternals.forEach](callbackfn, thisArg) {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return __classPrivateFieldGet(this, _Tree_children, "f").forEach((tree, index) => callbackfn(tree, index, this));
        }
        [TreeInternals.values]() {
            return __classPrivateFieldGet(this, _Tree_children, "f").values();
        }
        get [Symbol.toStringTag]() {
            return this.constructor.name;
        }
        [TreeInternals.iterator]() {
            return __classPrivateFieldGet(this, _Tree_children, "f")[Symbol.iterator]();
        }
    }
    Trees.Tree = Tree;
})(Trees || (Trees = {}));
var Tree = Trees.Tree;
let ArrayTree = (() => {
    var _a, _b;
    let _classSuper = Tree;
    let _instanceExtraInitializers = [];
    let _get_children_decorators;
    return _a = class ArrayTree extends _classSuper {
            constructor() {
                super(...arguments);
                this.at = (__runInitializers(this, _instanceExtraInitializers), super[Tree.at]);
                this.values = super[Tree.values];
                this.push = super[Tree.push];
                this.unshift = super[Tree.unshift];
                this.pop = super[Tree.pop];
                this.shift = super[Tree.shift];
                this.splice = super[Tree.splice];
                this[_b] = super[Tree.iterator];
            }
            get length() {
                return super[Tree.treeLength];
            }
            get children() {
                return [...this];
            }
        },
        _b = Symbol.iterator,
        (() => {
            var _c;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_c = _classSuper[Symbol.metadata]) !== null && _c !== void 0 ? _c : null) : void 0;
            _get_children_decorators = [enumerable];
            __esDecorate(_a, null, _get_children_decorators, { kind: "getter", name: "children", static: false, private: false, access: { has: obj => "children" in obj, get: obj => obj.children }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
let BinaryTree = (() => {
    var _a;
    let _classSuper = Tree;
    let _instanceExtraInitializers = [];
    let _get_left_decorators;
    let _get_right_decorators;
    return _a = class BinaryTree extends _classSuper {
            set left(value) {
                this[Tree.splice](0, 1, value);
            }
            get left() {
                return this[Tree.at](0);
            }
            set right(value) {
                this[Tree.splice](1, 1, value);
            }
            get right() {
                return this[Tree.at](1);
            }
            constructor() {
                super(...arguments);
                __runInitializers(this, _instanceExtraInitializers);
            }
        },
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _get_left_decorators = [enumerable];
            _get_right_decorators = [enumerable];
            __esDecorate(_a, null, _get_left_decorators, { kind: "getter", name: "left", static: false, private: false, access: { has: obj => "left" in obj, get: obj => obj.left }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _get_right_decorators, { kind: "getter", name: "right", static: false, private: false, access: { has: obj => "right" in obj, get: obj => obj.right }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
function createAsyncPeekableIterator(asyncIterable) {
    let iter = asyncIterable[Symbol.asyncIterator]();
    let next = iter.next();
    const it = (async function* () {
        let done = false, value;
        while (!done) {
            ({ done, value } = await next);
            if (!done) {
                next = iter.next();
                yield value;
            }
        }
    })();
    it.peek = async function peek() {
        return (await next).value;
    };
    return it;
}
function createPeekableIterator(iterable) {
    let iter = iterable[Symbol.iterator]();
    let next = iter.next();
    const it = (function* () {
        let done = false, value;
        while (!done) {
            ({ done, value } = next);
            if (!done) {
                next = iter.next();
                yield value;
            }
        }
    })();
    it.peek = function peek() {
        return next.value;
    };
    return it;
}
/*
 * MIT License
 *
 * Copyright (c) 2022 Trin Wasinger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var CSV;
(function (CSV) {
    function validateDelimiter(delimiter) {
        if (delimiter.length !== 1)
            throw new Error('CSV delimiter must be exactly one character (code unit) long');
    }
    function escapeDelimiterForRegExp(delimiter) {
        return delimiter.replace(/[.*+?^${}()|[\]\\\-]/g, String.raw `\$&`);
    }
    function stringify(values, replacer, { header = true, delimiter = ',' } = {}) {
        validateDelimiter(delimiter);
        const quotePattern = new RegExp(String.raw `[\n${escapeDelimiterForRegExp(delimiter)}"]`);
        function q([key, value]) {
            const s = `${replacer ? replacer(key, value) : value}`;
            return quotePattern.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        }
        function l(values) {
            return values.map(q).join(delimiter);
        }
        return (header ? `${l(Object.keys(values[0]).map(key => [null, key]))}\n` : '') + values.map(o => l(Object.entries(o))).join('\n');
    }
    CSV.stringify = stringify;
    function parse(text, reviver, { header = true, delimiter = ',' } = {}) {
        var _a;
        validateDelimiter(delimiter);
        const escapedDelimiter = escapeDelimiterForRegExp(delimiter), pattern = new RegExp(String.raw `(${escapedDelimiter}|\r?\n|\r|^)(?:"((?:\\.|""|[^\\"])*)"|([^${escapedDelimiter}"\r\n]*))`, 'gi'), entries = [[]];
        let matches = null;
        while (matches = pattern.exec(text)) {
            if (matches[1].length && matches[1] !== delimiter)
                entries.push([]);
            entries.at(-1).push(matches[2] ?
                matches[2].replace(/[\\"](.)/g, '$1') :
                (_a = matches[3]) !== null && _a !== void 0 ? _a : '');
        }
        if (!header || !entries.length)
            return entries.map((value, i) => reviver ? reviver(i.toString(), value) : value);
        const headerEntry = entries.shift().map(key => reviver ? reviver(null, key) : key);
        return entries.map(entry => Object.fromEntries(entry.map((value, i) => [headerEntry[i], reviver ? reviver(headerEntry[i], value) : value])));
    }
    CSV.parse = parse;
    function fromCammelCase(s) {
        return s[0].toUpperCase() + s.slice(1).replace(/[A-Z]/, ' $&');
    }
    CSV.fromCammelCase = fromCammelCase;
    function toCammelCase(s) {
        return s[0].toLowerCase() + s.slice(1).replaceAll(' ', '');
    }
    CSV.toCammelCase = toCammelCase;
})(CSV || (CSV = {}));
function* range(arg0, arg1, arg2) {
    var _a;
    function numerical(t) {
        return typeof arg0 === 'bigint' ? BigInt(t) : t;
    }
    function destr(t) {
        return typeof t === 'string' ? t.charCodeAt(0) : t;
    }
    const [min, max] = (arg1 === undefined ? [numerical(0), destr(arg0)] : [destr(arg0), destr(arg1)]);
    const step = ((_a = destr(arg2)) !== null && _a !== void 0 ? _a : numerical(1));
    let n = min;
    if (max < min) {
        throw new RangeError('Range min cannot be greater than max');
    }
    if (typeof arg0 === 'string') {
        while (n <= max) {
            yield String.fromCharCode(n);
            n += step;
        }
    }
    else {
        while (n < max) {
            yield n;
            n += step;
        }
    }
}
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?
var Graphviz;
(function (Graphviz) {
    // Note label overrides attributes.label which overrides using Symbol.toStringTag
    Graphviz.label = Symbol('Graphviz.label');
    Graphviz.children = Symbol('Graphviz.children');
    Graphviz.attributes = Symbol('Graphviz.attributes');
    function text(text, attributes = {}) {
        return { ...attributes, [Graphviz.label]: text };
    }
    Graphviz.text = text;
    function stringifyAttributes(attributes) {
        return attributes ? `[${Object.entries(attributes).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')}]` : '';
    }
    function serialize(obj, { output } = {}) {
        const iter = (function* () {
            let start = 0;
            while (true)
                yield start++;
        })();
        const nodes = new Map();
        const data = [];
        data.push('digraph {');
        function recurse(parent, edge, obj) {
            var _a, _b, _c;
            if (typeof obj !== 'object' || obj === null)
                return;
            if (!nodes.has(obj)) {
                nodes.set(obj, `Node${iter.shift()}`);
            }
            const name = nodes.get(obj);
            const attributes = (_a = obj[Graphviz.attributes]) !== null && _a !== void 0 ? _a : {};
            if (Graphviz.label in obj)
                attributes.label = obj[Graphviz.label];
            (_b = attributes.label) !== null && _b !== void 0 ? _b : (attributes.label = Symbol.toStringTag in obj ? obj[Symbol.toStringTag] : Object.prototype.toString.apply(obj));
            data.push(`\t${name}${stringifyAttributes(attributes)}`);
            if (parent != null) {
                data.push(`${parent}->${name}${stringifyAttributes({ label: edge })}`);
            }
            const keys = (_c = obj[Graphviz.children]) !== null && _c !== void 0 ? _c : Object.keys(obj);
            for (const [key, child] of Array.isArray(keys) && Array.isArray(keys[0]) ? keys : Object.entries(Array.isArray(keys) ? obj : keys)) {
                if (!Array.isArray(keys) || keys.includes(key) || Array.isArray(keys[0])) {
                    if (Array.isArray(child)) {
                        for (const [i, arrayChild] of Array.entries(child)) {
                            recurse(name, `${key}[${i}]`, arrayChild);
                        }
                    }
                    else {
                        recurse(name, key, child);
                    }
                }
            }
        }
        recurse(null, null, obj);
        data.push('}');
        const text = data.join('\n');
        if (typeof output === 'string') {
            system.writeTextFileSync(output, text);
        }
        return text;
    }
    Graphviz.serialize = serialize;
})(Graphviz || (Graphviz = {}));
var Parsing;
(function (Parsing) {
    var _a, _b;
    class AbstractParseTree extends Tree {
        constructor(name) {
            super();
            this.name = name;
        }
    }
    let ParseTreeNode = (() => {
        var _c, _d;
        let _classSuper = AbstractParseTree;
        let _instanceExtraInitializers = [];
        let _get_children_decorators;
        return _c = class ParseTreeNode extends _classSuper {
                constructor(name) {
                    super(name);
                    this.at = (__runInitializers(this, _instanceExtraInitializers), super[Tree.at]);
                    this.values = super[Tree.values];
                    this.push = super[Tree.push];
                    this.unshift = super[Tree.unshift];
                    this.pop = super[Tree.pop];
                    this.shift = super[Tree.shift];
                    this.splice = super[Tree.splice];
                    this[_d] = super[Tree.iterator];
                }
                get parent() {
                    return super.parent;
                }
                get length() {
                    return super[Tree.treeLength];
                }
                get children() {
                    return [...this];
                }
                get [(_d = Symbol.iterator, _get_children_decorators = [enumerable], Graphviz.label)]() {
                    return this.name;
                }
                get [Graphviz.children]() {
                    return this.children.map(x => ['', x]);
                }
            },
            (() => {
                var _a;
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
                __esDecorate(_c, null, _get_children_decorators, { kind: "getter", name: "children", static: false, private: false, access: { has: obj => "children" in obj, get: obj => obj.children }, metadata: _metadata }, null, _instanceExtraInitializers);
                if (_metadata) Object.defineProperty(_c, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            })(),
            _c;
    })();
    Parsing.ParseTreeNode = ParseTreeNode;
    class ParseTreeLambdaNode extends AbstractParseTree {
        constructor() {
            super(CFG.LAMBDA_CHARACTER);
            this[_a] = CFG.LAMBDA_CHARACTER;
        }
    }
    _a = Graphviz.label;
    Parsing.ParseTreeLambdaNode = ParseTreeLambdaNode;
    class ParseTreeEOFNode extends AbstractParseTree {
        constructor() {
            super(CFG.EOF_CHARACTER);
            this[_b] = CFG.EOF_CHARACTER;
        }
    }
    _b = Graphviz.label;
    Parsing.ParseTreeEOFNode = ParseTreeEOFNode;
    class ParseTreeTokenNode extends AbstractParseTree {
        constructor(name, value) {
            super(name);
            this.value = value;
        }
        get [Graphviz.label]() {
            return this.name === this.value ? this.name : `${this.name}:${this.value}`;
        }
    }
    Parsing.ParseTreeTokenNode = ParseTreeTokenNode;
    class SyntaxError extends Error {
        constructor(message, pos) {
            super(message);
            this.pos = pos;
        }
    }
    Parsing.SyntaxError = SyntaxError;
    /*
        void - nothing happened, run * transform if given
        ParseTreeNode | ASTNodeType | ASTNodeType[] - replace with return value and break
        null - delete node
    */
    class SyntaxTransformer {
        constructor(rules) {
            this.rules = rules instanceof Map ? rules : new Map(Object.entries(rules));
            for (const [key, value] of this.rules.entries()) {
                if (key.includes('|')) {
                    for (const branch of key.split('|').map(x => x.trim())) {
                        this.rules.set(branch, value);
                    }
                    this.rules.delete(key);
                }
            }
        }
        transform(node) {
            for (const rule of [node.name, '*']) {
                if (this.rules.has(rule)) {
                    const rvalue = this.rules.get(rule).bind(node)(node);
                    if (rvalue !== undefined) {
                        return rvalue;
                    }
                }
            }
            return node;
            /*
            // Hold a reference to the current parrent
                    const parent = Current.parent as InnerParseTree;

                    // Disjoin completed node
                    const node = parent.pop() as ParseTreeNode;
                    let rvalue: any = node;
                    
                    // Apply NonTerminal specific transforms
                    if(rvalue === node && this.sdt.has(node.name as NonTerminal)) {
                        rvalue = this.sdt.get(node.name as NonTerminal)(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }

                    // Apply wildcard transforms
                    if(rvalue === node && this.sdt.has('*')) {
                        rvalue = this.sdt.get('*')(node);
                        if(rvalue === undefined) {
                            rvalue = node;
                        }
                    }
                    
                    // Restore connections
                    if(Array.isArray(rvalue)) {
                        parent.push(...rvalue);
                    } else if(rvalue != null) {
                        parent.push(rvalue as InnerParseTree);
                    }

                    // Continue parsing
                    Current = parent as InnerParseTree;
            
            
            
            
            
            */
        }
    }
    Parsing.SyntaxTransformer = SyntaxTransformer;
})(Parsing || (Parsing = {}));
var SLR1;
(function (SLR1) {
    const MARKER = Symbol('SLR1.marker');
    class CFSM {
        constructor(G) {
            this.G = G;
            this.itemSets = new SignatureSet([this.closure(this.freshStarts(this.G.startingSymbol))]);
            this.edges = new SignatureSet();
            this.numbers = new SignatureMap();
            for (const I of this.itemSets) {
                let n = -1;
                while (n != this.itemSets.size) {
                    n = this.itemSets.size;
                    for (const X of this.G.getGrammarSymbols()) {
                        const R = this.goto(I, X);
                        if (R.size !== 0) {
                            this.itemSets.add(R);
                            this.edges.add([I, X, R]);
                        }
                    }
                }
            }
            const iter = (function* () {
                let start = 0;
                while (true)
                    yield start++;
            })();
            for (const I of this.itemSets) {
                this.numbers.set(I, iter.shift());
            }
        }
        getSetNumber(I) {
            var _a;
            return (_a = this.numbers.get(I)) !== null && _a !== void 0 ? _a : -1;
        }
        freshStarts(B) {
            return new SignatureSet(this.G.getRuleListFor(B).map(([lhs, rhs]) => [lhs, MARKER, ...rhs, ...(B === this.G.startingSymbol ? [CFG.EOF] : [])]));
        }
        closure(I) {
            const C = new SignatureSet(I);
            let size = -1;
            while (C.size != size) {
                size = C.size;
                for (const [lhs, ...rhs] of [...C]) {
                    const B = rhs[rhs.indexOf(MARKER) + 1];
                    if (CFG.isNonTerminal(B)) {
                        C.takeUnion(this.freshStarts(B));
                    }
                }
            }
            return C;
        }
        goto(I, X) {
            const K = new SignatureSet(I[Symbol.iterator]()
                .filter(([lhs, ...rhs]) => rhs[rhs.indexOf(MARKER) + 1] === X)
                .map(function (k) {
                const i = k.indexOf(MARKER);
                if (i > 0 && i < k.length - 1) {
                    return [
                        k[0],
                        ...k.slice(1, i),
                        k[i + 1],
                        k[i],
                        ...k.slice(i + 2)
                    ];
                }
                return [...k];
            }));
            return this.closure(K);
        }
        getItemSets() {
            return this.itemSets;
        }
        getEdges() {
            return this.edges;
        }
        [Symbol.iterator]() {
            return this.itemSets[Symbol.iterator]();
        }
    }
    SLR1.CFSM = CFSM;
    function createParseTable(cfg) {
        const cfsm = new CFSM(cfg);
        const T = new Map();
        for (const I of cfsm) {
            const i = cfsm.getSetNumber(I);
            T.set(i, new Map());
            for (const X of cfg.getGrammarSymbols()) {
                if (I[Symbol.iterator]().some(([lhs, ...rhs]) => [...rhs, false /*bounds check*/][rhs.indexOf(MARKER) + 1] === X)) {
                    T.get(i).set(X, `sh-${cfsm.getSetNumber(cfsm.goto(I, X))}`);
                }
            }
            for (const P of I[Symbol.iterator]().filter(([lhs, ...rhs]) => rhs.at(-1) === MARKER)) {
                const [A] = P;
                for (const f of cfg.followSet(A)) {
                    if (T.get(i).get(f) !== undefined) {
                        throw new Error(`Grammar is not SLR(1) (Caused by item set ${i})`);
                    }
                    T.get(i).set(f, `r-${cfg.getRuleNumber([P[0], P.slice(1).filter(x => x !== MARKER)])}`);
                }
            }
            let P;
            if (P = I[Symbol.iterator]().find(([lhs, ...rhs]) => rhs.at(-1) === MARKER && rhs.at(-2) === CFG.EOF && cfg.isStartingRule(lhs))) {
                T.set(i, new Map(cfg.getGrammarSymbols().map(x => [x, `R-${cfg.getRuleNumber([P[0], P.slice(1).filter(x => x !== MARKER)])}`])));
            }
        }
        return T;
    }
    SLR1.createParseTable = createParseTable;
    class SLR1Parser {
        constructor(cfg, sdt = new Parsing.SyntaxTransformer({}), cache) {
            this.cfg = cfg;
            this.sdt = sdt;
            // Try to load from cache
            try {
                if (cache !== undefined) {
                    const { signature, table } = JSON.parse(LZCompression.decompressFromUint8Array(system.readFileSync(cache)));
                    if (Signature.create(cfg) === signature) {
                        this.parseTable = this.deserializeTableFromCSV(table);
                    }
                }
            }
            catch (e) { }
            if (this.parseTable === undefined) {
                this.parseTable = createParseTable(cfg);
                // Save to cache
                try {
                    if (cache !== undefined) {
                        system.writeFileSync(cache, LZCompression.compressToUint8Array(JSON.stringify({ signature: Signature.create(cfg), table: this.serializeTableToCSV() })));
                    }
                }
                catch (e) { }
            }
        }
        deserializeTableFromCSV(csv) {
            const T = new Map();
            const [[_, ...header], ...rows] = csv.trim().split('\n').map(x => x.split(','));
            for (const row of rows) {
                const R = new Map();
                T.set(+row.shift(), R);
                for (const i of range(row.length)) {
                    R.set(header[i] === CFG.EOF_CHARACTER ? CFG.EOF : header[i], row[i]);
                }
            }
            return T;
        }
        serializeTableToCSV() {
            const T = this.getParseTable();
            const data = [['.', ...this.cfg.getGrammarSymbols().map(s => s !== null && s !== void 0 ? s : CFG.EOF_CHARACTER)].join(',')];
            for (const [i, R] of T.entries()) {
                const row = new Map(this.cfg.getGrammarSymbols().map(s => [s, undefined]));
                for (const [k, v] of R.entries()) {
                    row.set(k, v);
                }
                data.push([i, ...row.values().map(x => x !== null && x !== void 0 ? x : '')].join(','));
            }
            return data.join('\n');
        }
        getCFG() {
            return this.cfg;
        }
        getParseTable() {
            return this.parseTable;
        }
        parse(tokens) {
            var _a, _b, _c, _d, _e, _f;
            const T = this.parseTable;
            const cfg = this.cfg;
            const sdt = this.sdt;
            const ts = createPeekableIterator(tokens);
            const D = [];
            const S = [];
            S.push({ state: 0 });
            const ruleList = cfg.getRuleList();
            function reduce(n) {
                var _a, _b;
                const [lhs, rhs] = ruleList[n];
                const node = new ParseTreeNode(lhs);
                if (rhs.length === 0) {
                    node.push(new ParseTreeLambdaNode());
                }
                else {
                    for (const expected of [...rhs, ...(cfg.isStartingRule(lhs) ? [undefined] : [])].reverse()) {
                        const { state, tree: t } = S.pop();
                        if (CFG.isEOF(expected) && t === undefined) {
                            node.unshift(new ParseTreeEOFNode());
                        }
                        else if (CFG.isTerminal(expected) && t instanceof Token) {
                            node.unshift(new ParseTreeTokenNode(t.name, t.value));
                        }
                        else if (CFG.isNonTerminal(expected) && t instanceof Tree) {
                            const child = sdt.transform(t);
                            if (Array.isArray(child)) {
                                node.unshift(...child);
                            }
                            else if (child != null) {
                                node.unshift(child);
                            }
                            // node.unshift(t);
                        }
                        else {
                            throw new Parsing.SyntaxError(`Expected '${expected !== null && expected !== void 0 ? expected : 'EOF'}' got '${(_b = (_a = t === null || t === void 0 ? void 0 : t.name) !== null && _a !== void 0 ? _a : t) !== null && _b !== void 0 ? _b : 'EOF'}'`);
                        }
                    }
                }
                return node;
            }
            while (true) { //todo not in 0
                let t = (_a = D.at(0)) !== null && _a !== void 0 ? _a : ts.peek();
                const [action, v] = (_c = (_b = T.get(S.at(-1).state).get(t === null || t === void 0 ? void 0 : t.name)) === null || _b === void 0 ? void 0 : _b.split('-')) !== null && _c !== void 0 ? _c : [];
                if (action === undefined) {
                    throw new Parsing.SyntaxError(`Expected one of ${T.get(S.at(-1).state).keys().map(x => `'${x !== null && x !== void 0 ? x : 'EOF'}'`).toArray().join(', ')} got '${(_e = (_d = t === null || t === void 0 ? void 0 : t.name) !== null && _d !== void 0 ? _d : t) !== null && _e !== void 0 ? _e : 'EOF'}'`);
                }
                const n = +v;
                if (action === 'sh') {
                    const t = (_f = D.shift()) !== null && _f !== void 0 ? _f : ts.shift();
                    S.push({ state: n, tree: t });
                }
                else if (action === 'r') {
                    D.unshift(reduce(n));
                }
                else if (action === 'R') {
                    return this.sdt.transform(reduce(n));
                }
            }
        }
    }
    SLR1.SLR1Parser = SLR1Parser;
    var ParseTreeNode = Parsing.ParseTreeNode;
    var ParseTreeLambdaNode = Parsing.ParseTreeLambdaNode;
    var ParseTreeEOFNode = Parsing.ParseTreeEOFNode;
    var ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
})(SLR1 || (SLR1 = {}));
var ZLang;
(function (ZLang) {
    const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
        0x23, 0x23, 0x23, 0xa, 0x23, 0x20, 0x5a, 0x4f, 0x42, 0x4f, 0x53, 0x2e, 0x43, 0x46, 0x47, 0x20, 0x2d, 0x2d, 0x2d, 0x20, 0x5a, 0x4f, 0x42, 0x4f, 0x53, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x43, 0x5a, 0x41, 0x52, 0x20, 0x63, 0x6f, 0x6d, 0x70, 0x69, 0x6c, 0x65, 0x72, 0x20, 0x70, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x73, 0xa, 0x23, 0x20, 0x54, 0x68, 0x69, 0x73, 0x20, 0x69, 0x73, 0x20, 0x61, 0x6e, 0x20, 0x53, 0x4c, 0x52, 0x28, 0x31, 0x29, 0x20, 0x67, 0x72, 0x61, 0x6d, 0x6d, 0x61, 0x72, 0xa, 0x23, 0x23, 0x23, 0xa, 0x4d, 0x4f, 0x44, 0x55, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0x20, 0x24, 0xa, 0xa, 0x23, 0x20, 0x61, 0x20, 0x4d, 0x4f, 0x44, 0x55, 0x4c, 0x45, 0x20, 0x69, 0x73, 0x20, 0x61, 0x20, 0x2a, 0x6e, 0x6f, 0x6e, 0x2d, 0x65, 0x6d, 0x70, 0x74, 0x79, 0x2a, 0x20, 0x63, 0x6f, 0x6c, 0x6c, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x6f, 0x66, 0x20, 0x67, 0x6c, 0x6f, 0x62, 0x61, 0x6c, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x73, 0x2c, 0x20, 0x46, 0x55, 0x4e, 0x53, 0x49, 0x47, 0x73, 0x2c, 0xa, 0x23, 0x20, 0x6f, 0x72, 0x20, 0x46, 0x55, 0x4e, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x20, 0x64, 0x65, 0x66, 0x69, 0x6e, 0x69, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0xa, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x47, 0x4f, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x47, 0x4f, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x47, 0x46, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x47, 0x46, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x53, 0x49, 0x47, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x53, 0x49, 0x47, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x20, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x20, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x20, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x20, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x52, 0x41, 0x4e, 0x44, 0x20, 0x20, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x52, 0x41, 0x4e, 0x44, 0x20, 0x20, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x45, 0x4c, 0x53, 0x45, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x45, 0x4c, 0x53, 0x45, 0x20, 0x20, 0x20, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x20, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x44, 0x4f, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x44, 0x4f, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0x20, 0x73, 0x63, 0x20, 0x7c, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0x20, 0x73, 0x63, 0x20, 0x4d, 0x4f, 0x44, 0x50, 0x41, 0x52, 0x54, 0x53, 0xa, 0xa, 0xa, 0x47, 0x4f, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x2d, 0x3e, 0x20, 0x4f, 0x54, 0x48, 0x45, 0x52, 0x54, 0x59, 0x50, 0x45, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x53, 0xa, 0x47, 0x46, 0x54, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x2d, 0x3e, 0x20, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x53, 0xa, 0xa, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0x20, 0x7c, 0x20, 0x69, 0x6e, 0x74, 0x20, 0x7c, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x20, 0xa, 0x4f, 0x54, 0x48, 0x45, 0x52, 0x54, 0x59, 0x50, 0x45, 0x20, 0x2d, 0x3e, 0x20, 0x63, 0x6f, 0x6e, 0x73, 0x74, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x63, 0x6f, 0x6e, 0x73, 0x74, 0x20, 0x69, 0x6e, 0x74, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x63, 0x6f, 0x6e, 0x73, 0x74, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0xa, 0xa, 0x23, 0x20, 0x66, 0x75, 0x6e, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65, 0x73, 0x20, 0x28, 0x61, 0x6b, 0x61, 0x20, 0x22, 0x68, 0x65, 0x61, 0x64, 0x65, 0x72, 0x22, 0x20, 0x6f, 0x72, 0x20, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x74, 0x79, 0x70, 0x65, 0x29, 0x20, 0xa, 0x46, 0x55, 0x4e, 0x53, 0x49, 0x47, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x69, 0x64, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x50, 0x41, 0x52, 0x41, 0x4d, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x50, 0x41, 0x52, 0x41, 0x4d, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x2d, 0x3e, 0x20, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x69, 0x64, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x50, 0x41, 0x52, 0x41, 0x4d, 0x4c, 0x49, 0x53, 0x54, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x69, 0x64, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x6c, 0x61, 0x6d, 0x62, 0x64, 0x61, 0xa, 0x23, 0x4b, 0x45, 0x48, 0x2d, 0x32, 0x30, 0x32, 0x33, 0xa, 0x23, 0x4e, 0x4f, 0x50, 0x41, 0x52, 0x41, 0x4d, 0x53, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x6c, 0x61, 0x6d, 0x62, 0x64, 0x61, 0xa, 0xa, 0x23, 0x20, 0x66, 0x75, 0x6e, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x64, 0x65, 0x66, 0x69, 0x6e, 0x69, 0x74, 0x69, 0x6f, 0x6e, 0x73, 0x20, 0x69, 0x6d, 0x70, 0x6c, 0x69, 0x63, 0x69, 0x74, 0x6c, 0x79, 0x20, 0x64, 0x65, 0x63, 0x6c, 0x61, 0x72, 0x65, 0x20, 0x61, 0x20, 0x76, 0x61, 0x72, 0x69, 0x61, 0x62, 0x6c, 0x65, 0x20, 0x68, 0x6f, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x20, 0x74, 0x68, 0x65, 0x20, 0xa, 0x23, 0x20, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x20, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x20, 0x28, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x73, 0x20, 0x5f, 0x69, 0x64, 0x5f, 0x29, 0x20, 0x62, 0x65, 0x66, 0x6f, 0x72, 0x65, 0x20, 0x61, 0x6e, 0x79, 0x20, 0x66, 0x75, 0x6e, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x64, 0x65, 0x66, 0x69, 0x6e, 0x69, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x73, 0x74, 0x61, 0x74, 0x65, 0x6d, 0x65, 0x6e, 0x74, 0x73, 0xa, 0x46, 0x55, 0x4e, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x46, 0x55, 0x4e, 0x53, 0x49, 0x47, 0x20, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x73, 0x20, 0x69, 0x64, 0x20, 0x61, 0x73, 0x73, 0x69, 0x67, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x53, 0x54, 0x45, 0x50, 0x53, 0xa, 0xa, 0x23, 0x20, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x61, 0x72, 0x65, 0x20, 0x77, 0x72, 0x61, 0x70, 0x70, 0x65, 0x64, 0x20, 0x77, 0x69, 0x74, 0x68, 0x20, 0x6f, 0x70, 0x65, 0x6e, 0x2f, 0x63, 0x6c, 0x6f, 0x73, 0x65, 0x20, 0x73, 0x63, 0x6f, 0x70, 0x65, 0x20, 0x74, 0x72, 0x69, 0x67, 0x67, 0x65, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x74, 0x65, 0x72, 0x6d, 0x69, 0x6e, 0x61, 0x6c, 0x73, 0xa, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x2d, 0x3e, 0x20, 0x6c, 0x62, 0x72, 0x61, 0x63, 0x65, 0x20, 0x42, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x72, 0x62, 0x72, 0x61, 0x63, 0x65, 0xa, 0x42, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x42, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x42, 0x53, 0x54, 0x4d, 0x54, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x6c, 0x61, 0x6d, 0x62, 0x64, 0x61, 0xa, 0x42, 0x53, 0x54, 0x4d, 0x54, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x73, 0x63, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0x20, 0x73, 0x63, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x45, 0x4c, 0x53, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x44, 0x4f, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x57, 0x48, 0x49, 0x4c, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x73, 0x63, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x52, 0x41, 0x4e, 0x44, 0x20, 0x73, 0x63, 0xa, 0xa, 0x23, 0x20, 0x53, 0x4f, 0x4c, 0x4f, 0x53, 0x54, 0x4d, 0x54, 0x20, 0x61, 0x72, 0x65, 0x20, 0x74, 0x68, 0x6f, 0x73, 0x65, 0x20, 0x6f, 0x6e, 0x65, 0x2d, 0x6c, 0x69, 0x6e, 0x65, 0x72, 0x73, 0x20, 0x77, 0x65, 0x20, 0x70, 0x65, 0x72, 0x6d, 0x69, 0x74, 0x20, 0x61, 0x66, 0x74, 0x65, 0x72, 0x20, 0x69, 0x66, 0x28, 0x20, 0x29, 0x2c, 0x20, 0x65, 0x6c, 0x73, 0x65, 0x2c, 0x20, 0x77, 0x68, 0x69, 0x6c, 0x65, 0x28, 0x20, 0x29, 0x20, 0xa, 0x23, 0x20, 0x6e, 0x6f, 0x74, 0x65, 0x20, 0x74, 0x68, 0x65, 0x20, 0x61, 0x62, 0x73, 0x65, 0x6e, 0x63, 0x65, 0x20, 0x6f, 0x66, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x2c, 0x20, 0x73, 0x6f, 0x20, 0x77, 0x65, 0x20, 0x63, 0x61, 0x6e, 0x27, 0x74, 0x20, 0x64, 0x6f, 0xa, 0x23, 0x20, 0x20, 0x20, 0x69, 0x66, 0x28, 0x20, 0x78, 0x20, 0x3c, 0x20, 0x79, 0x20, 0x29, 0x20, 0x69, 0x6e, 0x74, 0x20, 0x78, 0x3b, 0xa, 0x23, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x63, 0x6f, 0x6e, 0x64, 0x69, 0x74, 0x69, 0x6f, 0x6e, 0x61, 0x6c, 0x6c, 0x79, 0x20, 0x64, 0x65, 0x63, 0x6c, 0x61, 0x72, 0x65, 0x20, 0x61, 0x20, 0x76, 0x61, 0x72, 0x69, 0x61, 0x62, 0x6c, 0x65, 0xa, 0x53, 0x4f, 0x4c, 0x4f, 0x53, 0x54, 0x4d, 0x54, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0x20, 0x73, 0x63, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x49, 0x46, 0x45, 0x4c, 0x53, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x57, 0x48, 0x49, 0x4c, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x73, 0x63, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x52, 0x41, 0x4e, 0x44, 0x20, 0x73, 0x63, 0xa, 0xa, 0x53, 0x54, 0x45, 0x50, 0x53, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x53, 0x4f, 0x4c, 0x4f, 0x53, 0x54, 0x4d, 0x54, 0xa, 0x9, 0x9, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x73, 0x63, 0xa, 0xa, 0x23, 0x20, 0x64, 0x65, 0x63, 0x6c, 0x61, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x76, 0x61, 0x72, 0x69, 0x61, 0x62, 0x6c, 0x65, 0x73, 0xa, 0x44, 0x45, 0x43, 0x4c, 0x54, 0x59, 0x50, 0x45, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x46, 0x55, 0x4e, 0x54, 0x59, 0x50, 0x45, 0x20, 0x7c, 0x20, 0x4f, 0x54, 0x48, 0x45, 0x52, 0x54, 0x59, 0x50, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0xa, 0xa, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x69, 0x64, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0xa, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x53, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x53, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0xa, 0x44, 0x45, 0x43, 0x4c, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x54, 0x59, 0x50, 0x45, 0x20, 0x44, 0x45, 0x43, 0x4c, 0x49, 0x44, 0x53, 0x20, 0xa, 0xa, 0x23, 0x20, 0x61, 0x73, 0x73, 0x69, 0x67, 0x6e, 0x6d, 0x65, 0x6e, 0x74, 0xa, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x69, 0x64, 0x20, 0x61, 0x73, 0x73, 0x69, 0x67, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x69, 0x64, 0x20, 0x61, 0x73, 0x73, 0x69, 0x67, 0x6e, 0x20, 0x41, 0x53, 0x53, 0x49, 0x47, 0x4e, 0xa, 0xa, 0x23, 0x20, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x6f, 0x6c, 0x20, 0x73, 0x74, 0x72, 0x75, 0x63, 0x74, 0x75, 0x72, 0x65, 0x73, 0xa, 0x49, 0x46, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x69, 0x66, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x53, 0x54, 0x45, 0x50, 0x53, 0xa, 0x49, 0x46, 0x45, 0x4c, 0x53, 0x45, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x69, 0x66, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x65, 0x6c, 0x73, 0x65, 0x20, 0x53, 0x54, 0x45, 0x50, 0x53, 0xa, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x77, 0x68, 0x69, 0x6c, 0x65, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x53, 0x54, 0x45, 0x50, 0x53, 0xa, 0x44, 0x4f, 0x57, 0x48, 0x49, 0x4c, 0x45, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x64, 0x6f, 0x20, 0x42, 0x52, 0x41, 0x43, 0x45, 0x53, 0x54, 0x4d, 0x54, 0x53, 0x20, 0x77, 0x68, 0x69, 0x6c, 0x65, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x73, 0x63, 0xa, 0xa, 0x45, 0x58, 0x50, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x7c, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x7c, 0x20, 0x46, 0x55, 0x4e, 0x43, 0x41, 0x4c, 0x4c, 0xa, 0xa, 0x23, 0x20, 0x66, 0x75, 0x6e, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x63, 0x61, 0x6c, 0x6c, 0x73, 0xa, 0x46, 0x55, 0x4e, 0x43, 0x41, 0x4c, 0x4c, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x69, 0x64, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x41, 0x52, 0x47, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x41, 0x52, 0x47, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x52, 0x47, 0x4c, 0x49, 0x53, 0x54, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x45, 0x58, 0x50, 0x52, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x45, 0x58, 0x50, 0x52, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x6c, 0x61, 0x6d, 0x62, 0x64, 0x61, 0xa, 0xa, 0x23, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0x65, 0x61, 0x6e, 0x20, 0x65, 0x78, 0x70, 0x72, 0x65, 0x73, 0x73, 0x69, 0x6f, 0x6e, 0x73, 0x2c, 0x20, 0x74, 0x72, 0x75, 0x65, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x66, 0x61, 0x6c, 0x73, 0x65, 0x20, 0x61, 0x72, 0x65, 0x20, 0x6c, 0x65, 0x78, 0x65, 0x64, 0x20, 0x61, 0x73, 0x20, 0x31, 0x42, 0x2c, 0x20, 0x30, 0x42, 0xa, 0x42, 0x4f, 0x4f, 0x4c, 0x53, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x6c, 0x74, 0x20, 0x7c, 0x20, 0x6c, 0x65, 0x71, 0x20, 0x7c, 0x20, 0x65, 0x71, 0x20, 0x7c, 0x20, 0x67, 0x65, 0x71, 0x20, 0x7c, 0x20, 0x67, 0x74, 0xa, 0x42, 0x45, 0x58, 0x50, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x42, 0x4f, 0x4f, 0x4c, 0x53, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0xa, 0xa, 0x23, 0x20, 0x61, 0x72, 0x69, 0x74, 0x68, 0x6d, 0x65, 0x74, 0x69, 0x63, 0x20, 0x65, 0x78, 0x70, 0x72, 0x65, 0x73, 0x73, 0x69, 0x6f, 0x6e, 0x73, 0xa, 0x50, 0x4c, 0x55, 0x53, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x70, 0x6c, 0x75, 0x73, 0x20, 0x7c, 0x20, 0x6d, 0x69, 0x6e, 0x75, 0x73, 0xa, 0x54, 0x49, 0x4d, 0x45, 0x53, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x6d, 0x75, 0x6c, 0x74, 0x20, 0x7c, 0x20, 0x64, 0x69, 0x76, 0x20, 0x7c, 0x20, 0x6d, 0x6f, 0x64, 0xa, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x53, 0x55, 0x4d, 0xa, 0x53, 0x55, 0x4d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x53, 0x55, 0x4d, 0x20, 0x50, 0x4c, 0x55, 0x53, 0x20, 0x50, 0x52, 0x4f, 0x44, 0x55, 0x43, 0x54, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x50, 0x52, 0x4f, 0x44, 0x55, 0x43, 0x54, 0xa, 0x50, 0x52, 0x4f, 0x44, 0x55, 0x43, 0x54, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x52, 0x4f, 0x44, 0x55, 0x43, 0x54, 0x20, 0x54, 0x49, 0x4d, 0x45, 0x53, 0x20, 0x56, 0x41, 0x4c, 0x55, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x56, 0x41, 0x4c, 0x55, 0x45, 0xa, 0x56, 0x41, 0x4c, 0x55, 0x45, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x64, 0x6f, 0x6d, 0x61, 0x69, 0x6e, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x69, 0x6e, 0x74, 0x76, 0x61, 0x6c, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x76, 0x61, 0x6c, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x76, 0x61, 0x6c, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x69, 0x64, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x55, 0x4e, 0x41, 0x52, 0x59, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x43, 0x41, 0x53, 0x54, 0xa, 0x55, 0x4e, 0x41, 0x52, 0x59, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x4c, 0x55, 0x53, 0x20, 0x56, 0x41, 0x4c, 0x55, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x6e, 0x6f, 0x74, 0x20, 0x56, 0x41, 0x4c, 0x55, 0x45, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x63, 0x6f, 0x6d, 0x70, 0x6c, 0x20, 0x56, 0x41, 0x4c, 0x55, 0x45, 0xa, 0x43, 0x41, 0x53, 0x54, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x69, 0x6e, 0x74, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0xa, 0x23, 0x20, 0x54, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x20, 0x77, 0x6f, 0x75, 0x6c, 0x64, 0x20, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x65, 0x20, 0x74, 0x68, 0x65, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x76, 0x61, 0x72, 0x69, 0x61, 0x62, 0x6c, 0x65, 0x20, 0x69, 0x64, 0x20, 0x6f, 0x6e, 0x20, 0x61, 0x6e, 0x20, 0x6f, 0x75, 0x74, 0x70, 0x75, 0x74, 0x20, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x2c, 0xa, 0x23, 0x20, 0x74, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x69, 0x6e, 0x69, 0x74, 0x69, 0x61, 0x6c, 0x20, 0x63, 0x68, 0x61, 0x72, 0x61, 0x63, 0x74, 0x65, 0x72, 0x20, 0x69, 0x6e, 0x64, 0x65, 0x78, 0x2c, 0x20, 0x74, 0x68, 0x65, 0x20, 0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x69, 0x73, 0x20, 0x74, 0x68, 0x65, 0xa, 0x23, 0x20, 0x6e, 0x75, 0x6d, 0x62, 0x65, 0x72, 0x20, 0x6f, 0x66, 0x20, 0x63, 0x68, 0x61, 0x72, 0x61, 0x63, 0x74, 0x65, 0x72, 0x73, 0x20, 0x74, 0x6f, 0x20, 0x65, 0x6d, 0x69, 0x74, 0x2e, 0xa, 0x23, 0x20, 0x54, 0x68, 0x65, 0x20, 0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x20, 0x70, 0x72, 0x6f, 0x64, 0x75, 0x63, 0x65, 0x73, 0x20, 0x74, 0x68, 0x65, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x20, 0x6f, 0x6e, 0x20, 0x61, 0x6e, 0x20, 0x6f, 0x75, 0x74, 0x70, 0x75, 0x74, 0x20, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x2e, 0x20, 0xa, 0x23, 0x20, 0x4f, 0x6e, 0x20, 0x20, 0x65, 0x6d, 0x69, 0x74, 0x20, 0x73, 0x79, 0x6d, 0x74, 0x61, 0x62, 0x6c, 0x65, 0x2c, 0x20, 0x77, 0x72, 0x69, 0x74, 0x65, 0x20, 0x74, 0x68, 0x65, 0x20, 0x63, 0x75, 0x72, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x73, 0x79, 0x6d, 0x62, 0x6f, 0x6c, 0x20, 0x74, 0x61, 0x62, 0x6c, 0x65, 0x20, 0x74, 0x6f, 0x20, 0x74, 0x68, 0x65, 0x20, 0x74, 0x68, 0x69, 0x72, 0x64, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x6e, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0xa, 0x23, 0x20, 0x61, 0x72, 0x67, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x20, 0x70, 0x72, 0x6f, 0x76, 0x69, 0x64, 0x65, 0x64, 0x20, 0x74, 0x6f, 0x20, 0x5a, 0x4f, 0x42, 0x4f, 0x53, 0xa, 0x45, 0x4d, 0x49, 0x54, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x65, 0x6d, 0x69, 0x74, 0x20, 0x69, 0x64, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x65, 0x6d, 0x69, 0x74, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x65, 0x6d, 0x69, 0x74, 0x20, 0x73, 0x79, 0x6d, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xa, 0xa, 0x23, 0x20, 0x49, 0x66, 0x20, 0x69, 0x64, 0x20, 0x69, 0x73, 0x20, 0x61, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x3a, 0x20, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x73, 0x20, 0x61, 0x20, 0x55, 0x6e, 0x69, 0x66, 0x6f, 0x72, 0x6d, 0x28, 0x30, 0x2c, 0x31, 0x29, 0x20, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x73, 0xa, 0x23, 0x20, 0x49, 0x66, 0x20, 0x69, 0x64, 0x20, 0x69, 0x73, 0x20, 0x61, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0x3a, 0x20, 0x20, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x73, 0x20, 0x61, 0x20, 0x42, 0x65, 0x72, 0x6e, 0x6f, 0x75, 0x6c, 0x6c, 0x69, 0x20, 0x72, 0x65, 0x73, 0x75, 0x6c, 0x74, 0x2c, 0x20, 0x4f, 0x6e, 0x65, 0x20, 0x6f, 0x72, 0x20, 0x5a, 0x65, 0x72, 0x6f, 0xa, 0x23, 0x20, 0x49, 0x66, 0x20, 0x69, 0x64, 0x20, 0x69, 0x73, 0x20, 0x61, 0x6e, 0x20, 0x69, 0x6e, 0x74, 0x3a, 0x20, 0x20, 0x72, 0x65, 0x71, 0x75, 0x69, 0x72, 0x65, 0x73, 0x20, 0x74, 0x77, 0x6f, 0x20, 0x6f, 0x74, 0x68, 0x65, 0x72, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x61, 0x72, 0x67, 0x73, 0x20, 0x74, 0x68, 0x61, 0x74, 0x20, 0x72, 0x65, 0x73, 0x6f, 0x6c, 0x76, 0x65, 0x20, 0x74, 0x6f, 0x20, 0x69, 0x6e, 0x74, 0x65, 0x67, 0x65, 0x72, 0x20, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x73, 0x2c, 0xa, 0x23, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x73, 0x20, 0x61, 0x6e, 0x20, 0x45, 0x71, 0x75, 0x61, 0x6c, 0x69, 0x6b, 0x65, 0x6c, 0x79, 0x28, 0x61, 0x2c, 0x62, 0x29, 0x20, 0x76, 0x61, 0x6c, 0x75, 0x65, 0x20, 0x69, 0x6e, 0x20, 0x74, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x69, 0x64, 0x65, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0xa, 0x52, 0x41, 0x4e, 0x44, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x2d, 0x3e, 0x20, 0x72, 0x61, 0x6e, 0x64, 0x20, 0x69, 0x64, 0x20, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x72, 0x61, 0x6e, 0x64, 0x20, 0x69, 0x64, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0x20, 0x41, 0x45, 0x58, 0x50, 0x52, 0xa
    ])));
    let TreeNodes;
    (function (TreeNodes) {
        class ZNode extends Tree {
            constructor() {
                super(...arguments);
                this.name = this.constructor.name;
            }
            get [Graphviz.label]() {
                return this.name;
            }
        }
        TreeNodes.ZNode = ZNode;
        class ExpressionNode extends ZNode {
        }
        TreeNodes.ExpressionNode = ExpressionNode;
        class BinaryOp extends ExpressionNode {
            constructor(name, lhs, rhs) {
                super();
                this.name = name;
                this.lhs = lhs;
                this.rhs = rhs;
            }
        }
        TreeNodes.BinaryOp = BinaryOp;
        class UnaryOp extends ExpressionNode {
            constructor(name, val) {
                super();
                this.name = name;
                this.val = val;
            }
        }
        TreeNodes.UnaryOp = UnaryOp;
        class CastNode extends ExpressionNode {
            constructor(type, val) {
                super();
                this.type = type;
                this.val = val;
            }
            get [Graphviz.label]() {
                return this.type[Graphviz.label];
            }
            get [Graphviz.children]() {
                return [['', this.val]];
            }
        }
        TreeNodes.CastNode = CastNode;
        class ParameterNode extends ZNode {
            constructor(type, name) {
                super();
                this.type = type;
                this.name = name;
            }
            get [Graphviz.label]() {
                return `${this.type[Graphviz.label]} ${this.name}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }
        TreeNodes.ParameterNode = ParameterNode;
        class FunctionHeaderNode extends ZNode {
            constructor(name, rtype, parameters) {
                super();
                this.name = name;
                this.rtype = rtype;
                this.parameters = parameters;
            }
            get [Graphviz.label]() {
                return `fn ${this.name}(...)`;
            }
        }
        TreeNodes.FunctionHeaderNode = FunctionHeaderNode;
        class TypeNode extends ZNode {
            constructor(type, meta) {
                super();
                this.type = type;
                this.meta = meta;
            }
            get [Graphviz.label]() {
                return `${this.meta.const ? 'const ' : ''}${this.type}`;
            }
            get [Graphviz.children]() {
                return [];
            }
        }
        TreeNodes.TypeNode = TypeNode;
        class FunctionCallNode extends ExpressionNode {
            constructor(name, args) {
                super();
                this.name = name;
                this.args = args;
            }
            get [Graphviz.label]() {
                return `${this.name}(...)`;
            }
        }
        TreeNodes.FunctionCallNode = FunctionCallNode;
        class FunctionNode extends ZNode {
            constructor(header, rvar, rvalue, body) {
                super();
                this.header = header;
                this.rvar = rvar;
                this.rvalue = rvalue;
                this.body = body;
            }
            get [Graphviz.label]() {
                return `${this.header[Graphviz.label]} {...}`;
            }
            get [Graphviz.children]() {
                return [['header', this.header], ['var', new ParseTreeTokenNode('id', this.rvar)], ['rvalue', this.rvalue], ['body', this.body]];
            }
        }
        TreeNodes.FunctionNode = FunctionNode;
        class Program extends ZNode {
            constructor(children) {
                super();
                this.children = children;
            }
            get [Graphviz.label]() {
                return 'Program.z';
            }
            get [Graphviz.children]() {
                return this.children.map((n, i) => [`statements[${i}]`, n]);
            }
        }
        TreeNodes.Program = Program;
        class DomainNode extends ExpressionNode {
            constructor(value) {
                super();
                this.value = value;
            }
            get [Graphviz.label]() {
                return `Domain`;
            }
            get [Graphviz.children]() {
                return [['', this.value]];
            }
        }
        TreeNodes.DomainNode = DomainNode;
        class StatementNode extends ZNode {
            constructor() {
                super();
            }
            get [Graphviz.label]() {
                return 'Statement';
            }
        }
        TreeNodes.StatementNode = StatementNode;
        class DeclareStatement extends StatementNode {
            constructor(type, entries) {
                super();
                this.type = type;
                this.entries = entries;
            }
            get [Graphviz.label]() {
                return 'Declare';
            }
            get [Graphviz.children]() {
                return [...Object.entries({ type: this.type }), ...this.entries.map(function (entry, i) {
                        return entry.length === 1 ? ['', new ParseTreeTokenNode('id', entry[0])] : ['', {
                                get [Graphviz.label]() {
                                    return '=';
                                },
                                get [Graphviz.children]() {
                                    return [['', new ParseTreeTokenNode('id', entry[0])], ['', entry[1]]];
                                }
                            }];
                    })];
            }
        }
        TreeNodes.DeclareStatement = DeclareStatement;
        class AssignmentStatement extends StatementNode {
            constructor(id, value) {
                super();
                this.id = id;
                this.value = value;
            }
            get [Graphviz.label]() {
                return '=';
            }
            get [Graphviz.children]() {
                return [['id', new ParseTreeTokenNode('id', this.id)], ...Object.entries({ value: this.value })];
            }
        }
        TreeNodes.AssignmentStatement = AssignmentStatement;
        class IfStatement extends StatementNode {
            constructor(predicate, btrue, bfalse) {
                super();
                this.predicate = predicate;
                this.btrue = btrue;
                this.bfalse = bfalse;
            }
            get [Graphviz.label]() {
                return this.bfalse !== undefined ? 'If-Else' : 'If';
            }
        }
        TreeNodes.IfStatement = IfStatement;
        class DoWhileStatement extends StatementNode {
            constructor(body, predicate) {
                super();
                this.body = body;
                this.predicate = predicate;
            }
            get [Graphviz.label]() {
                return 'Do While';
            }
        }
        TreeNodes.DoWhileStatement = DoWhileStatement;
        class WhileStatement extends StatementNode {
            constructor(predicate, body) {
                super();
                this.predicate = predicate;
                this.body = body;
            }
            get [Graphviz.label]() {
                return 'While';
            }
        }
        TreeNodes.WhileStatement = WhileStatement;
        class EmitStatement extends StatementNode {
            constructor(data) {
                super();
                this.data = data;
            }
            get [Graphviz.label]() {
                return 'Emit';
            }
            get [Graphviz.children]() {
                return [...(this.data.type === 'string' ? [['id', new ParseTreeTokenNode('id', this.data.id)]] : []), ...Object.entries(this.data)];
            }
        }
        TreeNodes.EmitStatement = EmitStatement;
        class RandStatement extends StatementNode {
            constructor(id, min, max) {
                super();
                this.id = id;
                this.min = min;
                this.max = max;
            }
            get [Graphviz.label]() {
                return 'Rand';
            }
            get [Graphviz.children]() {
                return [['id', new ParseTreeTokenNode('id', this.id)], ...[this.min !== undefined ? ['min', this.min] : []], ...[this.max !== undefined ? ['max', this.max] : []]];
            }
        }
        TreeNodes.RandStatement = RandStatement;
        class StatementGroup extends StatementNode {
            constructor(statements) {
                super();
                this.statements = statements;
            }
            get [Graphviz.label]() {
                return 'Statements';
            }
        }
        TreeNodes.StatementGroup = StatementGroup;
    })(TreeNodes || (TreeNodes = {}));
    var ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
    ZLang.sdt = new Parsing.SyntaxTransformer({
        '*'(node) {
            if (node.length === 1) {
                if (node.at(0) instanceof Parsing.ParseTreeLambdaNode) {
                    // Remove empty lambdas
                    return null;
                }
                else {
                    // Squish tree
                    return node.pop();
                }
            }
            else if (node.name.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0, node.length);
            }
        },
        // Expressions
        'SUM|PRODUCT|BEXPR'(node) {
            if (node.length === 1)
                return;
            return new TreeNodes.BinaryOp(node.at(1).value, node.shift(), node.pop());
        },
        UNARY(node) {
            if (node.length === 1)
                return;
            return new TreeNodes.UnaryOp(node.at(0).value, node.pop());
        },
        CAST(node) {
            return new TreeNodes.CastNode(node.at(0), node.at(2));
        },
        // Functions
        FUNSIG(node) {
            return new TreeNodes.FunctionHeaderNode(node.at(1).value, node.at(0), node.children.splice(3, node.length - 4));
        },
        PARAMLIST(node) {
            if (node.length === 1)
                return;
            if (node.length === 2) {
                return new TreeNodes.ParameterNode(node.at(0), node.at(1).value);
            }
            else {
                return [new TreeNodes.ParameterNode(node.at(0), node.at(1).value), ...node.splice(3, node.length)];
            }
        },
        FUNCALL(node) {
            return new TreeNodes.FunctionCallNode(node.at(0).value, node.splice(2, node.length - 3));
        },
        ARGLIST(node) {
            if (node.length === 1)
                return;
            node.splice(-2, 1);
            return node.splice(0, node.length);
        },
        FUNCTION(node) {
            return new TreeNodes.FunctionNode(node.splice(0, 1)[0], node.at(1).value, node.splice(-2, 1)[0], node.splice(-1, 1)[0]);
        },
        // Types
        'OTHERTYPE|FUNTYPE'(node) {
            return new TreeNodes.TypeNode(node.at(-1).value, { const: node.length > 1 && node.at(0).value === 'const' });
        },
        // General simplification
        MODULE(node) {
            return new TreeNodes.Program(node.splice(0, node.length - 1));
        },
        MODPARTS(node) {
            return node.splice(0, node.length).filter(n => n instanceof ParseTreeTokenNode ? n.name !== 'sc' : true);
        },
        VALUE(node) {
            if (node.length === 3) {
                return node.splice(1, 1);
            }
            else if (node.length === 4) {
                return new TreeNodes.DomainNode(node.splice(2, 1)[0]);
            }
        },
        BSTMT(node) {
            return node.splice(0, 1);
        },
        BSTMTS(node) {
            if (node.length === 1)
                return;
            return node.splice(0, node.length);
        },
        BRACESTMTS(node) {
            return new TreeNodes.StatementGroup(node.splice(1, node.length - 2));
        },
        SOLOSTMT(node) {
            return new TreeNodes.StatementGroup(node.splice(0, 1));
        },
        // Assignment and declaration
        ASSIGN(node) {
            return new TreeNodes.AssignmentStatement(node.at(0).value, node.splice(-1, 1)[0]);
        },
        'GFTDECLLIST|GOTDECLLIST|DECLLIST'(node) {
            return new TreeNodes.DeclareStatement(node.splice(0, 1)[0], node.splice(0, node.length).map(x => x instanceof TreeNodes.AssignmentStatement ? [x.id, x.value] : [x.value]));
        },
        DECLIDS(node) {
            return node.splice(0, node.length).filter(n => n instanceof ParseTreeTokenNode ? n.name !== 'comma' : true);
        },
        // Control Statements
        WHILE(node) {
            return new TreeNodes.WhileStatement(node.splice(2, 1)[0], node.splice(-1, 1)[0]);
        },
        DOWHILE(node) {
            return new TreeNodes.DoWhileStatement(node.splice(1, 1)[0], node.splice(-3, 1)[0]);
        },
        IF(node) {
            return new TreeNodes.IfStatement(node.splice(2, 1)[0], node.splice(-1, 1)[0]);
        },
        IFELSE(node) {
            return new TreeNodes.IfStatement(node.splice(2, 1)[0], node.splice(-3, 1)[0], node.splice(-1, 1)[0]);
        },
        // Special Statements
        EMIT(node) {
            switch (node.length) {
                case 2:
                    return new TreeNodes.EmitStatement({
                        type: node.at(-1).value
                    });
                case 4:
                    return new TreeNodes.EmitStatement({
                        type: 'value',
                        value: node.splice(2, 1)[0]
                    });
                case 6:
                    return new TreeNodes.EmitStatement({
                        type: 'string',
                        id: node.at(1).value,
                        index: node.splice(3, 1)[0],
                        length: node.splice(-1, 1)[0]
                    });
            }
        },
        RAND(node) {
            switch (node.length) {
                case 2:
                    return new TreeNodes.RandStatement(node.at(1).value);
                case 6:
                    return new TreeNodes.RandStatement(node.at(1).value, node.splice(3, 1)[0], node.splice(-1, 1)[0]);
            }
        }
    });
    console.debug('Building Parser...');
    const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, 'zlang.json.lz');
    console.debug('Done!');
    function parse(tokens) {
        return PARSER.parse(tokens);
    }
    ZLang.parse = parse;
})(ZLang || (ZLang = {}));
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?
var LL1;
(function (LL1) {
    function convertLeftRecursion(cfg) {
        const newRules = new Map();
        function getTailOverrlap(a, b) {
            let overlap = [];
            let i = -1;
            while (a.at(i) === b.at(i) && a.at(i) !== undefined) {
                overlap.unshift(a.at(i--));
            }
            return overlap;
        }
        function arrayEquals(a, b) {
            return a.length === b.length && a.every((e, i) => e === b[i]);
        }
        for (const N of cfg.getNonTerminals()) {
            // Sort by descending length to ensure we see non lambda rules first
            const rules = new Set(cfg.getRuleListFor(N).sort(([lhsA, rhsA], [lhsB, rhsB]) => rhsB.length - rhsA.length));
            newRules.set(N, []);
            refactor: for (const [lhs1, rhs1, ref1] of rules.values().map(r => [...r, r])) {
                if (rhs1[0] === lhs1) {
                    for (const [lhs2, rhs2, ref2] of rules.values().map(x => [...x, x])) {
                        if (rhs1 === rhs2) {
                            continue;
                        }
                        const beta = getTailOverrlap(rhs1, rhs2);
                        if (arrayEquals(rhs2, beta)) {
                            const A = lhs1;
                            const gamma = rhs1.slice(1, rhs1.length - beta.length);
                            rules.delete(ref1);
                            rules.delete(ref2); // Don't visit again
                            const R = CFG.makeUniqueNonTerminal(cfg, N);
                            newRules.get(N).push([...beta, R]);
                            newRules.set(R, [[...gamma, ...beta, R], []]);
                            continue refactor;
                        }
                    }
                }
                newRules.get(N).push(rhs1); // No refactor happened
            }
        }
        return new CFG(cfg.startingSymbol, newRules, new Set(cfg.getTerminals()));
    }
    function leftFactor(cfg) {
        const newRules = new Map();
        for (const N of cfg.getNonTerminals()) {
            const rules = new Set(cfg.getRuleListFor(N));
            newRules.set(N, []);
            for (const [lhs1, rhs1, ref1] of rules.values().map(r => [...r, r])) {
                if (rhs1.length < 1) {
                    newRules.get(N).push(rhs1);
                    continue;
                }
                const pre1 = rhs1[0];
                const W = CFG.makeUniqueNonTerminal(cfg, N);
                let anyOverlaps = false;
                for (const [lhs2, rhs2, ref2] of rules.values().map(r => [...r, r])) {
                    const pre2 = rhs2[0];
                    if (rhs1 !== rhs2 && pre1 === pre2) {
                        if (!anyOverlaps) {
                            newRules.set(W, []);
                        }
                        anyOverlaps = true;
                        newRules.get(W).push(rhs2.slice(1));
                        rules.delete(ref2);
                    }
                }
                if (anyOverlaps) {
                    newRules.get(W).push(rhs1.slice(1));
                    newRules.get(N).push([pre1, W]);
                    rules.delete(ref1);
                }
                else {
                    newRules.get(N).push(rhs1);
                }
            }
        }
        return new CFG(cfg.startingSymbol, newRules, new Set(cfg.getTerminals()));
    }
    // Note, some of the optimizations can't see through  A -> B -> C rules
    // Ideally, we'd optimize those out first, but that's nyi (or maybe compare with first sets?)
    function transform(cfg) {
        let k;
        do {
            k = cfg.getRuleList().length;
            cfg = leftFactor(cfg);
        } while (k != cfg.getRuleList().length);
        return convertLeftRecursion(cfg);
    }
    function createParseTable(cfg) {
        const parseTable = new Map(cfg.getNonTerminals().map(N => [N, new Map(cfg.getTerminalsAndEOF().map(a => [a, -1]))]));
        let i = 0;
        for (const lhs of cfg.getNonTerminals()) {
            const rules = cfg.getRuleListFor(lhs).map(([_, rhs]) => rhs);
            const row = parseTable.get(lhs);
            for (const rhs of rules) {
                const P = cfg.predictSet([lhs, rhs]);
                for (const a of P) {
                    if (row.get(a) != -1) {
                        // Possibly implement C hack for dangling bracket here later on or just mark issue
                        throw new Error(`Grammar is not LL(1) (Caused by rules ${row.get(a)} and ${i})`);
                    }
                    else {
                        row.set(a, i);
                    }
                }
                i++;
            }
        }
        return parseTable;
    }
    class LL1Parser {
        constructor(cfg, sdt) {
            this.cfg = transform(cfg);
            this.parseTable = createParseTable(this.cfg);
            this.sdt = sdt;
        }
        getCFG() {
            return this.cfg;
        }
        getParseTable() {
            return this.parseTable;
        }
        parse(tokens) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const LLT = this.parseTable;
            const P = this.cfg.getRuleList();
            const ts = createPeekableIterator(tokens);
            const MARKER = Symbol();
            const T = new ParseTreeNode();
            const K = [];
            let Current = T;
            K.push(this.cfg.startingSymbol);
            let pos = undefined;
            while (K.length) {
                let x = K.pop();
                if (x === MARKER) {
                    // Hold a reference to the current parrent
                    const parent = Current.parent;
                    // Disjoin completed node
                    const node = this.sdt.transform(parent.pop());
                    // Restore connections
                    if (Array.isArray(node)) {
                        parent.push(...node);
                    }
                    else if (node != null) {
                        parent.push(node);
                    }
                    // Continue parsing
                    Current = parent;
                }
                else if (CFG.isNonTerminal(x)) {
                    let p = (_f = P[(_c = (_a = LLT.get(x)) === null || _a === void 0 ? void 0 : _a.get((_b = ts.peek()) === null || _b === void 0 ? void 0 : _b.name)) !== null && _c !== void 0 ? _c : throws(new Parsing.SyntaxError(`Unexpected token ${(_e = (_d = ts.peek()) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : 'EOF'}`, pos))]) !== null && _f !== void 0 ? _f : throws(new Parsing.SyntaxError(`Syntax Error: Unexpected token ${(_h = (_g = ts.peek()) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : 'EOF'}`, pos));
                    K.push(MARKER);
                    const R = p[1];
                    if (this.cfg.isStartingRule(p)) {
                        K.push(CFG.EOF);
                    }
                    if (R.length) {
                        K.push(...[...R].reverse());
                    }
                    else {
                        K.push(CFG.LAMBDA_CHARACTER);
                    }
                    const n = new ParseTreeNode(x);
                    Current.push(n);
                    Current = Current.at(-1);
                }
                else if (CFG.isTerminalOrEOF(x)) {
                    if (x !== ((_j = ts.peek()) === null || _j === void 0 ? void 0 : _j.name)) {
                        throw new Parsing.SyntaxError(`Unexpected token ${(_l = (_k = ts.peek()) === null || _k === void 0 ? void 0 : _k.name) !== null && _l !== void 0 ? _l : 'EOF'} expected ${x}`, pos);
                    }
                    x = ts.shift();
                    pos = x === null || x === void 0 ? void 0 : x.pos;
                    Current.push(x instanceof Token ? new ParseTreeTokenNode(x.name, x.value) : new ParseTreeEOFNode());
                }
                else if (CFG.isLambda(x)) {
                    Current.push(new ParseTreeLambdaNode());
                }
            }
            if (T.length !== 1) {
                throw new Parsing.SyntaxError(undefined, pos);
            }
            return T.pop();
        }
    }
    LL1.LL1Parser = LL1Parser;
    var ParseTreeNode = Parsing.ParseTreeNode;
    var ParseTreeLambdaNode = Parsing.ParseTreeLambdaNode;
    var ParseTreeEOFNode = Parsing.ParseTreeEOFNode;
    var ParseTreeTokenNode = Parsing.ParseTreeTokenNode;
})(LL1 || (LL1 = {}));
var LL1Parser = LL1.LL1Parser;
var FiniteAutomata;
(function (FiniteAutomata) {
    class NFAContext {
        constructor(alphabet) {
            this.alphabet = alphabet;
            this.iter = (function* (i = 0) {
                while (true)
                    yield i++;
            })();
        }
        createState() {
            return this.iter.shift();
        }
        createStates(n = 1) {
            return [...this.iter.shift(n)];
        }
        lambdaWrap(nfa) {
            const [start, end] = this.createStates(2);
            return {
                start,
                end,
                edges: [[start, nfa.start], ...nfa.edges, [nfa.end, end]]
            };
        }
    }
    FiniteAutomata.NFAContext = NFAContext;
    function toDFA(nfa, ctx) {
        function followLambda(S) {
            S = new Set(S);
            const M = [...S];
            while (M.length) {
                const t = M.pop();
                for (const q of nfa.edges.flatMap(function ([from, to, char]) {
                    return char === undefined && from === t ? [to] : [];
                })) {
                    if (!S.has(q)) {
                        S.add(q);
                        M.push(q);
                    }
                }
            }
            return sorted(S);
        }
        function followChar(S, c) {
            const F = new Set();
            for (const t of S) {
                for (const q of nfa.edges.flatMap(function ([from, to, char]) {
                    return char === c && from === t ? [to] : [];
                })) {
                    F.add(q);
                }
            }
            return sorted(F);
        }
        function sorted(S) {
            return new Set([...S].sort((a, b) => a - b));
        }
        const T = new SignatureMap();
        const L = [];
        const A = sorted(new Set([nfa.end]));
        const i = nfa.start;
        const B = followLambda([i]);
        T.set(B, Object.assign(new Map(), { start: true }));
        if (A.intersection(new Set(B)).size) {
            T.get(B).accepting = true;
        }
        L.push(B);
        do {
            const S = L.pop();
            for (const c of ctx.alphabet) {
                const R = followLambda(followChar(S, c));
                T.get(S).set(c, R);
                if (R.size && !(T.has(R))) {
                    T.set(R, new Map());
                    if (A.intersection(new Set(R)).size) {
                        T.get(R).accepting = true;
                    }
                    L.push(R);
                }
            }
        } while (L.length);
        const dfa = new Map();
        const n = (function () {
            const M = new SignatureMap();
            let n = 0;
            return function (state) {
                if (!M.has(state)) {
                    M.set(state, n++);
                }
                return M.get(state);
            };
        })();
        for (const [state, value] of T.entries()) {
            dfa.set(n(state), Object.assign(new Map(value.entries().flatMap(([c, state]) => state.size ? [[c, n(state)]] : [])), Object.fromEntries(Object.entries(value))));
        }
        return dfa;
    }
    FiniteAutomata.toDFA = toDFA;
    function optimizeDFA(dfa, ctx) {
        const T = dfa;
        // Remove dead states
        // console.log(FiniteAutomata.optimizeDFA(new Map([
        //     [0,Object.assign(new Map([['a',1],['b',2]]),{start:true})],
        //     [1,Object.assign(new Map([['a',1]]),{accepting:true})],
        //     [2,Object.assign(new Map([['a',2]]),{})] // Dead
        // ] as any), new FiniteAutomata.NFAContext(new Set(['a','b','c']))));
        function removeDeadStates() {
            var _a;
            const A = new Set(); // Accessible states
            const M = new Map(T.entries().map(([k, _]) => [k, T.entries().flatMap(([n, v]) => v.values().toArray().includes(k) ? [n] : []).toArray()]));
            const L = T.entries().filter(([k, v]) => v.accepting).map(([k]) => k).toArray();
            while (L.length) {
                const s = L.pop();
                if (!A.has(s)) {
                    for (const p of (_a = M.get(s)) !== null && _a !== void 0 ? _a : []) {
                        L.push(p);
                    }
                    A.add(s);
                }
            }
            const V = new Set(); // Removed states
            for (const [k, v] of T.entries()) {
                if (A.has(k))
                    continue;
                V.add(k);
                T.delete(k);
            }
            // Fix ids
            for (const v of T.values()) {
                for (const [k, t] of v.entries()) {
                    if (V.has(t)) {
                        v.delete(k);
                    }
                }
            }
        }
        function mergeStates() {
            const T = dfa;
            const M = new Set();
            const L = [];
            L.push([T.entries().filter(([k, v]) => v.accepting).map(([k]) => k).toArray(), [...ctx.alphabet]]);
            L.push([T.entries().filter(([k, v]) => !v.accepting).map(([k]) => k).toArray(), [...ctx.alphabet]]);
            // Identify duplicates
            do {
                const [S, C] = L.pop();
                const c = C.shift();
                const P = Object.values(Object.groupBy(S, s => { var _a; return (_a = T.get(s).get(c)) !== null && _a !== void 0 ? _a : `${undefined}`; }));
                for (const X of P.filter(X => X.length > 1)) {
                    if (!C.length) {
                        M.add(X);
                    }
                    else {
                        L.push([X, [...C]]);
                    }
                }
            } while (L.length);
            // Merge into first
            for (const X of M) {
                const s0 = X.shift();
                const J = T.get(s0);
                const V = new Set(); // Removed states
                for (const s of X) {
                    J.accepting || (J.accepting = T.get(s).accepting);
                    T.delete(s);
                    V.add(s);
                }
                // Fix ids
                for (const v of T.values()) {
                    for (const [k, t] of v.entries()) {
                        if (V.has(t)) {
                            v.set(k, s0);
                        }
                    }
                }
            }
        }
        removeDeadStates();
        let size;
        do {
            size = T.size;
            mergeStates();
        } while (size != T.size);
        // Pull down ids
        const G = T.keys().reduce((G, s) => { G[s] = s; return G; }, []).reduce((a, c) => [...a, c], []);
        for (const [k, v] of [...T.entries()]) { // Get initial state with ... to ignore updates
            T.delete(k);
            const g = G.indexOf(k);
            T.set(g, v);
            for (const [k, t] of v) {
                v.set(k, G.indexOf(t));
            }
        }
        return dfa;
    }
    FiniteAutomata.optimizeDFA = optimizeDFA;
})(FiniteAutomata || (FiniteAutomata = {}));
var RegexEngine;
(function (RegexEngine) {
    var NFAContext = FiniteAutomata.NFAContext;
    let TreeNodes;
    (function (TreeNodes) {
        var _a, _b;
        class RegexNode extends Tree {
            constructor() {
                super(...arguments);
                this.name = this.constructor.name;
            }
        }
        TreeNodes.RegexNode = RegexNode;
        class AltNode extends RegexNode {
            constructor(nodes) {
                super();
                this.nodes = nodes;
            }
            getChildNodes() {
                return [...this.nodes];
            }
            clone() {
                return new this.constructor(this.nodes.map(node => node.clone()));
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                const nfa = { start, end, edges: [] };
                for (const subgraph of this.nodes[Symbol.iterator]().map(node => node.toNFA(ctx))) {
                    nfa.edges.push([start, subgraph.start]);
                    nfa.edges.push(...subgraph.edges);
                    nfa.edges.push([subgraph.end, end]);
                }
                return ctx.lambdaWrap(nfa);
            }
        }
        TreeNodes.AltNode = AltNode;
        class SeqNode extends RegexNode {
            constructor(nodes) {
                super();
                this.nodes = nodes;
            }
            getChildNodes() {
                return [...this.nodes];
            }
            clone() {
                return new this.constructor(this.nodes.map(node => node.clone()));
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                const nfa = { start, end, edges: [] };
                let prev = nfa.start;
                for (const subgraph of this.nodes[Symbol.iterator]().map(node => node.toNFA(ctx))) {
                    nfa.edges.push([prev, subgraph.start]);
                    nfa.edges.push(...subgraph.edges);
                    prev = subgraph.end;
                }
                nfa.edges.push([prev, nfa.end]);
                return ctx.lambdaWrap(nfa);
            }
        }
        TreeNodes.SeqNode = SeqNode;
        class RangeNode extends RegexNode {
            constructor(min, max) {
                super();
                this.min = min;
                this.max = max;
            }
            get [Graphviz.children]() {
                return {
                    min: Graphviz.text(this.min),
                    max: Graphviz.text(this.max),
                };
            }
            clone() {
                return new this.constructor(this.min, this.max);
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: range(this.min, this.max).filter(char => ctx.alphabet.has(char)).map(char => [start, end, char]).toArray()
                });
            }
        }
        TreeNodes.RangeNode = RangeNode;
        class KleenNode extends RegexNode {
            constructor(node) {
                super();
                this.node = node;
                this[_a] = '*';
            }
            clone() {
                return new this.constructor(this.node.clone());
            }
            toNFA(ctx) {
                const state = ctx.createState();
                const nfa = { start: state, end: state, edges: [] };
                const subgraph = this.node.toNFA(ctx);
                nfa.edges.push([state, subgraph.start]);
                nfa.edges.push(...subgraph.edges);
                nfa.edges.push([subgraph.end, state]);
                return ctx.lambdaWrap(nfa);
            }
        }
        _a = Graphviz.label;
        TreeNodes.KleenNode = KleenNode;
        class CharNode extends RegexNode {
            constructor(char) {
                super();
                this.char = char;
            }
            get [Graphviz.label]() {
                return this.char;
            }
            clone() {
                return new this.constructor(this.char);
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: [[start, end, this.char]]
                });
            }
        }
        TreeNodes.CharNode = CharNode;
        class WildcharNode extends RegexNode {
            // TODO, it might be better to support wildchars and charsets in the matcher to reduce nfa size?
            clone() {
                return new this.constructor();
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: ctx.alphabet.values().map(char => [start, end, char]).toArray()
                });
            }
        }
        TreeNodes.WildcharNode = WildcharNode;
        class LambdaNode extends RegexNode {
            constructor() {
                super(...arguments);
                this[_b] = CFG.LAMBDA_CHARACTER;
            }
            clone() {
                return new this.constructor();
            }
            toNFA(ctx) {
                const [start, end] = ctx.createStates(2);
                return ctx.lambdaWrap({
                    start,
                    end,
                    edges: [[start, end]]
                });
            }
        }
        _b = Graphviz.label;
        TreeNodes.LambdaNode = LambdaNode;
    })(TreeNodes || (TreeNodes = {}));
    var RegexNode = TreeNodes.RegexNode;
    const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
        0x53, 0x20, 0x2d, 0x3e, 0x20, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x24, 0xd, 0xa, 0xd, 0xa, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0xd, 0xa, 0xd, 0xa, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x25, 0x7c, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0xd, 0xa, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0x20, 0x2d, 0x3e, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0x20, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0x20, 0x7c, 0x20, 0xce, 0xbb, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0xd, 0xa, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x25, 0x2a, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x25, 0x2b, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0xd, 0xa, 0xd, 0xa, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x69, 0x74, 0x69, 0x76, 0x65, 0x20, 0x7c, 0x20, 0x25, 0x28, 0x20, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x25, 0x29, 0xd, 0xa, 0x50, 0x72, 0x69, 0x6d, 0x69, 0x74, 0x69, 0x76, 0x65, 0x20, 0x2d, 0x3e, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x7c, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x25, 0x2d, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x7c, 0x20, 0x25, 0x2e
    ])));
    const PARSER = new LL1Parser(GRAMMAR, new Parsing.SyntaxTransformer({
        '*'(node) {
            if (node.length === 1) {
                if (node.at(0) instanceof Parsing.ParseTreeLambdaNode) {
                    // Remove empty lambdas
                    return null;
                }
                else {
                    // Squish tree
                    return node.pop();
                }
            }
            else if (node.name.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0, node.length);
            }
        },
        Primitive(node) {
            const [first, , second] = [...node];
            if (first.name === 'char' && (second === null || second === void 0 ? void 0 : second.name) === 'char') {
                return new TreeNodes.RangeNode(first.value, second.value);
            }
            else if (first.name === 'char') {
                return new TreeNodes.CharNode(first.value);
            }
            else if (first.name === '%.') {
                return new TreeNodes.WildcharNode();
            }
        },
        Sequence(node) {
            if (node.length === 1)
                return node.shift();
            return new TreeNodes.SeqNode([...node].flatMap(node => node instanceof TreeNodes.SeqNode ? node.getChildNodes() : [node]));
        },
        Alternation(node) {
            const l = node.length;
            const children = node.splice(0, node.length).filter(x => x instanceof RegexNode);
            // Joining n items requires n-1 separators. if 2n-1 != num children, there exists an extra %|
            if (2 * children.length - 1 !== l) {
                children.push(new TreeNodes.LambdaNode());
            }
            return new TreeNodes.AltNode(children); // Todo, flatten this?
        },
        Quantifier(node) {
            const mod = node.at(1);
            if (mod instanceof Parsing.ParseTreeTokenNode) {
                switch (mod.name) {
                    case '%+': return new TreeNodes.SeqNode([node.at(0), new TreeNodes.KleenNode(node.shift().clone())]);
                    case '%*': return new TreeNodes.KleenNode(node.shift());
                }
            }
        },
        Primary(node) {
            return node.length === 1 ? node.shift() : node.splice(1, 1);
        },
        S(node) {
            return node.shift();
        }
    }));
    function isHex(text) {
        return text.split('').every(c => '0123456789abcdef'.includes(c.toLowerCase()));
    }
    function* tokenize(text) {
        const iter = text[Symbol.iterator]();
        let c;
        let col = 0, line = 1;
        while ((c = iter.shift()) !== undefined) {
            switch (c) {
                case '\\':
                    {
                        const e = iter.shift();
                        switch (e) {
                            case '\\':
                            case '(':
                            case ')':
                            case '+':
                            case '*':
                            case '-':
                            case '.':
                            case '|':
                                yield new Token('char', e, { line, col });
                                break;
                            case 's':
                                yield new Token('char', ' ', { line, col });
                                break;
                            case 'n':
                                yield new Token('char', '\n', { line, col });
                                break;
                            case 'u':
                                const hex = iter.take(4).toArray().join('');
                                const n = Number.parseInt(hex, 16);
                                if (hex.length != 4 || !isHex(hex) || Number.isNaN(n)) {
                                    throw new Error(`Invalid unicode escape sequence '\\u${hex}'`);
                                }
                                yield new Token('char', String.fromCharCode(n), { line, col });
                                break;
                            default:
                                throw new Error(`Unknown escape sequence '\\${e}'`);
                        }
                        break;
                    }
                    ;
                case '(':
                case ')':
                case '+':
                case '*':
                case '-':
                case '.':
                case '|':
                    yield new Token('%' + c, c, { line, col });
                    break;
                default:
                    yield new Token('char', c, { line, col });
                    break;
            }
            if (c === '\n')
                line++;
            col++;
        }
    }
    RegexEngine.tokenize = tokenize;
    function parse(text) {
        return PARSER.parse(tokenize(text));
    }
    RegexEngine.parse = parse;
    function compile(text, alphabet) {
        const ctx = new NFAContext(alphabet);
        const [start, end] = ctx.createStates(2);
        const ast = RegexEngine.parse(text);
        const nfa = ast.toNFA(ctx);
        return {
            start,
            end,
            edges: [[start, nfa.start], ...nfa.edges, [nfa.end, end]],
        };
    }
    RegexEngine.compile = compile;
})(RegexEngine || (RegexEngine = {}));
class Scanner {
    constructor(alphabet, lambdaChar, patterns) {
        this.alphabet = alphabet;
        this.lambdaChar = lambdaChar;
        this.patterns = patterns;
    }
    static fromString(text, cache) {
        // Try to load from cache
        try {
            if (cache !== undefined) {
                const { signature, alphabet, patterns, lambdaChar } = JSON.parse(LZCompression.decompressFromUint8Array(system.readFileSync(cache)));
                if (Signature.create(text) === signature) {
                    return new Scanner(new Set(alphabet), lambdaChar, new Map(patterns.map(([k, { dfa, value }]) => [k, { dfa: new Map(dfa.map(([k, v]) => [k, new Map(v)])), value }])));
                }
            }
        }
        catch (e) { }
        const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
        const alphabet = new Set(lines.shift().split(/\s+/g).flatMap(x => alphaDecode(x).split('')));
        const lambdaCharacter = (function (alphabet) {
            for (const c of range(String.fromCharCode(1), String.fromCharCode(127))) {
                if (!alphabet.has(c))
                    return c;
            }
            throw new Error('No sutible lambda ascii character found!');
        })(new Set(alphabet));
        const patterns = new Map();
        const ctx = new FiniteAutomata.NFAContext(alphabet);
        for (const line of lines) {
            const [regex, name, value] = line.split(/\s+/g);
            // console.debug(`Compiling regex ${name}...`)
            const nfa = RegexEngine.compile(regex, alphabet);
            const dfa = FiniteAutomata.optimizeDFA(FiniteAutomata.toDFA(nfa, ctx), ctx);
            patterns.set(name, {
                dfa, value: value !== null && value !== void 0 ? value : name
            });
        }
        const scanner = new Scanner(alphabet, lambdaCharacter, patterns);
        // Save to cache
        try {
            if (cache !== undefined) {
                system.writeFileSync(cache, LZCompression.compressToUint8Array(JSON.stringify({
                    signature: Signature.create(text),
                    alphabet: [...scanner.alphabet],
                    patterns: scanner.patterns.entries().map(([k, { dfa, value }]) => [k, { dfa: dfa.entries().map(([k, v]) => [k, v.entries().toArray()]).toArray(), value }]).toArray(),
                    lambdaCharacter
                })));
            }
        }
        catch (e) { }
        return scanner;
    }
}
(function (ZLang) {
    console.log('Building Scanner...');
    const SCANNER = Scanner.fromString(new BasicTextDecoder().decode(new Uint8Array([
        0x78, 0x30, 0x61, 0x20, 0x78, 0x32, 0x30, 0x20, 0x78, 0x32, 0x31, 0x20, 0x78, 0x32, 0x32, 0x20, 0x20, 0x78, 0x32, 0x33, 0x20, 0x20, 0x78, 0x32, 0x34, 0x20, 0x20, 0x78, 0x32, 0x35, 0x20, 0x20, 0x78, 0x32, 0x36, 0x20, 0x20, 0x78, 0x32, 0x37, 0x20, 0x20, 0x78, 0x32, 0x38, 0x20, 0x20, 0x78, 0x32, 0x39, 0x20, 0x20, 0x78, 0x32, 0x61, 0x20, 0x78, 0x32, 0x62, 0x20, 0x78, 0x32, 0x63, 0x20, 0x78, 0x32, 0x64, 0x20, 0x78, 0x32, 0x65, 0x20, 0x78, 0x32, 0x66, 0x20, 0x30, 0x20, 0x31, 0x20, 0x32, 0x20, 0x33, 0x20, 0x34, 0x20, 0x35, 0x20, 0x36, 0x20, 0x37, 0x20, 0x38, 0x20, 0x39, 0x20, 0x78, 0x33, 0x61, 0x20, 0x78, 0x33, 0x62, 0x20, 0x78, 0x33, 0x63, 0x20, 0x78, 0x33, 0x64, 0x20, 0x78, 0x33, 0x65, 0x20, 0x78, 0x33, 0x66, 0x20, 0x78, 0x34, 0x30, 0x20, 0x20, 0x41, 0x20, 0x42, 0x20, 0x43, 0x20, 0x44, 0x20, 0x45, 0x20, 0x46, 0x20, 0x47, 0x20, 0x48, 0x20, 0x49, 0x20, 0x4a, 0x20, 0x4b, 0x20, 0x4c, 0x20, 0x4d, 0x20, 0x4e, 0x20, 0x4f, 0x20, 0x50, 0x20, 0x51, 0x20, 0x52, 0x20, 0x53, 0x20, 0x54, 0x20, 0x55, 0x20, 0x56, 0x20, 0x57, 0x20, 0x58, 0x20, 0x59, 0x20, 0x5a, 0x20, 0x78, 0x35, 0x62, 0x20, 0x78, 0x35, 0x64, 0x20, 0x78, 0x35, 0x65, 0x20, 0x78, 0x35, 0x66, 0x20, 0x78, 0x36, 0x30, 0x20, 0x20, 0x61, 0x20, 0x62, 0x20, 0x63, 0x20, 0x64, 0x20, 0x65, 0x20, 0x66, 0x20, 0x67, 0x20, 0x68, 0x20, 0x69, 0x20, 0x6a, 0x20, 0x6b, 0x20, 0x6c, 0x20, 0x6d, 0x20, 0x6e, 0x20, 0x6f, 0x20, 0x70, 0x20, 0x71, 0x20, 0x72, 0x20, 0x73, 0x20, 0x74, 0x20, 0x75, 0x20, 0x76, 0x20, 0x77, 0x20, 0x78, 0x37, 0x38, 0x20, 0x79, 0x20, 0x7a, 0x20, 0x78, 0x37, 0x62, 0x20, 0x78, 0x37, 0x63, 0x20, 0x78, 0x37, 0x64, 0x20, 0x78, 0x37, 0x65, 0x20, 0xd, 0xa, 0x28, 0x5c, 0x6e, 0x7c, 0x5c, 0x73, 0x29, 0x2a, 0x23, 0x28, 0x5c, 0x73, 0x7c, 0x21, 0x7c, 0x23, 0x7c, 0x24, 0x7c, 0x25, 0x7c, 0x26, 0x7c, 0x27, 0x7c, 0x5c, 0x28, 0x7c, 0x5c, 0x29, 0x7c, 0x5c, 0x2a, 0x7c, 0x5c, 0x2b, 0x7c, 0x2c, 0x7c, 0x5c, 0x2d, 0x7c, 0x5c, 0x2e, 0x7c, 0x2f, 0x7c, 0x30, 0x7c, 0x31, 0x7c, 0x32, 0x7c, 0x33, 0x7c, 0x34, 0x7c, 0x35, 0x7c, 0x36, 0x7c, 0x37, 0x7c, 0x38, 0x7c, 0x39, 0x7c, 0x3a, 0x7c, 0x3b, 0x7c, 0x3c, 0x7c, 0x3d, 0x7c, 0x3e, 0x7c, 0x3f, 0x7c, 0x40, 0x7c, 0x41, 0x7c, 0x42, 0x7c, 0x43, 0x7c, 0x44, 0x7c, 0x45, 0x7c, 0x46, 0x7c, 0x47, 0x7c, 0x48, 0x7c, 0x49, 0x7c, 0x4a, 0x7c, 0x4b, 0x7c, 0x4c, 0x7c, 0x4d, 0x7c, 0x4e, 0x7c, 0x4f, 0x7c, 0x50, 0x7c, 0x51, 0x7c, 0x52, 0x7c, 0x53, 0x7c, 0x54, 0x7c, 0x55, 0x7c, 0x56, 0x7c, 0x57, 0x7c, 0x58, 0x7c, 0x59, 0x7c, 0x5a, 0x7c, 0x5b, 0x7c, 0x5d, 0x7c, 0x5e, 0x7c, 0x5f, 0x7c, 0x60, 0x7c, 0x61, 0x7c, 0x62, 0x7c, 0x63, 0x7c, 0x64, 0x7c, 0x65, 0x7c, 0x66, 0x7c, 0x67, 0x7c, 0x68, 0x7c, 0x69, 0x7c, 0x6a, 0x7c, 0x6b, 0x7c, 0x6c, 0x7c, 0x6d, 0x7c, 0x6e, 0x7c, 0x6f, 0x7c, 0x70, 0x7c, 0x71, 0x7c, 0x72, 0x7c, 0x73, 0x7c, 0x74, 0x7c, 0x75, 0x7c, 0x76, 0x7c, 0x77, 0x7c, 0x78, 0x7c, 0x79, 0x7c, 0x7a, 0x7c, 0x7b, 0x7c, 0x5c, 0x7c, 0x7c, 0x7d, 0x7c, 0x7e, 0x29, 0x2a, 0x20, 0x20, 0x20, 0x45, 0x4f, 0x4c, 0x43, 0x4f, 0x4d, 0x4d, 0x45, 0x4e, 0x54, 0x20, 0x20, 0xd, 0xa, 0x2f, 0x5c, 0x2a, 0x28, 0x2f, 0x7c, 0x28, 0x5c, 0x73, 0x7c, 0x21, 0x7c, 0x23, 0x7c, 0x24, 0x7c, 0x25, 0x7c, 0x26, 0x7c, 0x27, 0x7c, 0x5c, 0x28, 0x7c, 0x5c, 0x29, 0x7c, 0x5c, 0x2b, 0x7c, 0x2c, 0x7c, 0x5c, 0x2d, 0x7c, 0x5c, 0x2e, 0x7c, 0x30, 0x7c, 0x31, 0x7c, 0x32, 0x7c, 0x33, 0x7c, 0x34, 0x7c, 0x35, 0x7c, 0x36, 0x7c, 0x37, 0x7c, 0x38, 0x7c, 0x39, 0x7c, 0x3a, 0x7c, 0x3b, 0x7c, 0x3c, 0x7c, 0x3d, 0x7c, 0x3e, 0x7c, 0x3f, 0x7c, 0x40, 0x7c, 0x41, 0x7c, 0x42, 0x7c, 0x43, 0x7c, 0x44, 0x7c, 0x45, 0x7c, 0x46, 0x7c, 0x47, 0x7c, 0x48, 0x7c, 0x49, 0x7c, 0x4a, 0x7c, 0x4b, 0x7c, 0x4c, 0x7c, 0x4d, 0x7c, 0x4e, 0x7c, 0x4f, 0x7c, 0x50, 0x7c, 0x51, 0x7c, 0x52, 0x7c, 0x53, 0x7c, 0x54, 0x7c, 0x55, 0x7c, 0x56, 0x7c, 0x57, 0x7c, 0x58, 0x7c, 0x59, 0x7c, 0x5a, 0x7c, 0x5b, 0x7c, 0x5d, 0x7c, 0x5e, 0x7c, 0x5f, 0x7c, 0x60, 0x7c, 0x61, 0x7c, 0x62, 0x7c, 0x63, 0x7c, 0x64, 0x7c, 0x65, 0x7c, 0x66, 0x7c, 0x67, 0x7c, 0x68, 0x7c, 0x69, 0x7c, 0x6a, 0x7c, 0x6b, 0x7c, 0x6c, 0x7c, 0x6d, 0x7c, 0x6e, 0x7c, 0x6f, 0x7c, 0x70, 0x7c, 0x71, 0x7c, 0x72, 0x7c, 0x73, 0x7c, 0x74, 0x7c, 0x75, 0x7c, 0x76, 0x7c, 0x77, 0x7c, 0x78, 0x7c, 0x79, 0x7c, 0x7a, 0x7c, 0x7b, 0x7c, 0x5c, 0x7c, 0x7c, 0x7d, 0x7c, 0x7e, 0x29, 0x7c, 0x5c, 0x2a, 0x2b, 0x5f, 0x5f, 0x50, 0x49, 0x5f, 0x5f, 0x29, 0x2a, 0x5c, 0x2a, 0x2b, 0x2f, 0x20, 0x20, 0x49, 0x4e, 0x4c, 0x49, 0x4e, 0x45, 0x43, 0x53, 0x54, 0x59, 0x4c, 0x45, 0x43, 0x4f, 0x4d, 0x4d, 0x45, 0x4e, 0x54, 0x20, 0xd, 0xa, 0x63, 0x6f, 0x6e, 0x73, 0x74, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x63, 0x6f, 0x6e, 0x73, 0x74, 0xd, 0xa, 0x62, 0x6f, 0x6f, 0x6c, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x62, 0x6f, 0x6f, 0x6c, 0xd, 0xa, 0x69, 0x6e, 0x74, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x69, 0x6e, 0x74, 0xd, 0xa, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0xd, 0xa, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0xd, 0xa, 0x69, 0x66, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x69, 0x66, 0xd, 0xa, 0x65, 0x6c, 0x73, 0x65, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x65, 0x6c, 0x73, 0x65, 0xd, 0xa, 0x77, 0x68, 0x69, 0x6c, 0x65, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x77, 0x68, 0x69, 0x6c, 0x65, 0xd, 0xa, 0x65, 0x6d, 0x69, 0x74, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x65, 0x6d, 0x69, 0x74, 0xd, 0xa, 0x73, 0x79, 0x6d, 0x74, 0x61, 0x62, 0x6c, 0x65, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x73, 0x79, 0x6d, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xd, 0xa, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x73, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x72, 0x65, 0x74, 0x75, 0x72, 0x6e, 0x73, 0xd, 0xa, 0x72, 0x61, 0x6e, 0x64, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x72, 0x61, 0x6e, 0x64, 0xd, 0xa, 0x28, 0x5f, 0x7c, 0x61, 0x2d, 0x7a, 0x7c, 0x41, 0x2d, 0x5a, 0x29, 0x28, 0x5f, 0x7c, 0x61, 0x2d, 0x7a, 0x7c, 0x41, 0x2d, 0x5a, 0x7c, 0x30, 0x2d, 0x39, 0x29, 0x2a, 0x20, 0x69, 0x64, 0xd, 0xa, 0x28, 0x28, 0x31, 0x2d, 0x39, 0x29, 0x28, 0x30, 0x2d, 0x39, 0x29, 0x2a, 0x29, 0x7c, 0x30, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x69, 0x6e, 0x74, 0x76, 0x61, 0x6c, 0xd, 0xa, 0x28, 0x30, 0x2d, 0x39, 0x2b, 0x5c, 0x2e, 0x30, 0x2d, 0x39, 0x2b, 0x7c, 0x30, 0x2d, 0x39, 0x2b, 0x5c, 0x2e, 0x30, 0x2d, 0x39, 0x2a, 0x29, 0x20, 0x20, 0x20, 0x20, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x76, 0x61, 0x6c, 0xd, 0xa, 0x22, 0x28, 0x5c, 0x73, 0x7c, 0x21, 0x7c, 0x23, 0x7c, 0x24, 0x7c, 0x25, 0x7c, 0x26, 0x7c, 0x27, 0x7c, 0x5c, 0x28, 0x7c, 0x5c, 0x29, 0x7c, 0x5c, 0x2a, 0x7c, 0x5c, 0x2b, 0x7c, 0x2c, 0x7c, 0x5c, 0x2d, 0x7c, 0x5c, 0x2e, 0x7c, 0x2f, 0x7c, 0x30, 0x7c, 0x31, 0x7c, 0x32, 0x7c, 0x33, 0x7c, 0x34, 0x7c, 0x35, 0x7c, 0x36, 0x7c, 0x37, 0x7c, 0x38, 0x7c, 0x39, 0x7c, 0x3a, 0x7c, 0x3b, 0x7c, 0x3c, 0x7c, 0x3d, 0x7c, 0x3e, 0x7c, 0x3f, 0x7c, 0x40, 0x7c, 0x41, 0x7c, 0x42, 0x7c, 0x43, 0x7c, 0x44, 0x7c, 0x45, 0x7c, 0x46, 0x7c, 0x47, 0x7c, 0x48, 0x7c, 0x49, 0x7c, 0x4a, 0x7c, 0x4b, 0x7c, 0x4c, 0x7c, 0x4d, 0x7c, 0x4e, 0x7c, 0x4f, 0x7c, 0x50, 0x7c, 0x51, 0x7c, 0x52, 0x7c, 0x53, 0x7c, 0x54, 0x7c, 0x55, 0x7c, 0x56, 0x7c, 0x57, 0x7c, 0x58, 0x7c, 0x59, 0x7c, 0x5a, 0x7c, 0x5b, 0x7c, 0x5d, 0x7c, 0x5e, 0x7c, 0x5f, 0x7c, 0x60, 0x7c, 0x61, 0x7c, 0x62, 0x7c, 0x63, 0x7c, 0x64, 0x7c, 0x65, 0x7c, 0x66, 0x7c, 0x67, 0x7c, 0x68, 0x7c, 0x69, 0x7c, 0x6a, 0x7c, 0x6b, 0x7c, 0x6c, 0x7c, 0x6d, 0x7c, 0x6e, 0x7c, 0x6f, 0x7c, 0x70, 0x7c, 0x71, 0x7c, 0x72, 0x7c, 0x73, 0x7c, 0x74, 0x7c, 0x75, 0x7c, 0x76, 0x7c, 0x77, 0x7c, 0x78, 0x7c, 0x79, 0x7c, 0x7a, 0x7c, 0x7b, 0x7c, 0x5c, 0x7c, 0x7c, 0x7d, 0x7c, 0x7e, 0x29, 0x2b, 0x22, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x76, 0x61, 0x6c, 0xd, 0xa, 0x3c, 0x3d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6c, 0x65, 0x71, 0xd, 0xa, 0x3d, 0x3d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x65, 0x71, 0xd, 0xa, 0x3e, 0x3d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x67, 0x65, 0x71, 0xd, 0xa, 0x3d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x61, 0x73, 0x73, 0x69, 0x67, 0x6e, 0xd, 0xa, 0x3e, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x67, 0x74, 0xd, 0xa, 0x3c, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6c, 0x74, 0xd, 0xa, 0x5c, 0x2b, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x70, 0x6c, 0x75, 0x73, 0xd, 0xa, 0x5c, 0x2d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6d, 0x69, 0x6e, 0x75, 0x73, 0xd, 0xa, 0x21, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6e, 0x6f, 0x74, 0xd, 0xa, 0x7e, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x63, 0x6f, 0x6d, 0x70, 0x6c, 0xd, 0xa, 0x5c, 0x2a, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6d, 0x75, 0x6c, 0x74, 0xd, 0xa, 0x2f, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x64, 0x69, 0x76, 0xd, 0xa, 0x25, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6d, 0x6f, 0x64, 0xd, 0xa, 0x3b, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x73, 0x63, 0xd, 0xa, 0x7b, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6c, 0x62, 0x72, 0x61, 0x63, 0x65, 0xd, 0xa, 0x7d, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x72, 0x62, 0x72, 0x61, 0x63, 0x65, 0xd, 0xa, 0x5c, 0x28, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x6c, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xd, 0xa, 0x5c, 0x29, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x72, 0x70, 0x61, 0x72, 0x65, 0x6e, 0xd, 0xa, 0x2c, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x63, 0x6f, 0x6d, 0x6d, 0x61, 0xd, 0xa, 0x28, 0x5c, 0x73, 0x7c, 0x5c, 0x6e, 0x29, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x49, 0x47, 0x4e, 0x4f, 0x52, 0x45, 0xd, 0xa
    ])), 'zlex.json.lz');
    console.log('Done!');
})(ZLang || (ZLang = {}));
