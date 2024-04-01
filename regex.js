#!/usr/bin/env sjs
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
var _Tree_instances, _Tree_parent, _Tree_disown, _Tree_own;
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
    async function shift() {
        return (await this.next()).value;
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
    function shift() {
        return this.next().value;
    }
    IteratorShiftPolyfill.shift = shift;
})(IteratorShiftPolyfill || (IteratorShiftPolyfill = {}));
installPolyfill({ prototype: Object.getPrototypeOf(Object.getPrototypeOf((function* () { }).prototype)) }, IteratorShiftPolyfill);
var ObjectPolyfill;
(function (ObjectPolyfill) {
    function groupBy(values, callback) {
        return values.reduce((obj, value, index) => {
            var _a;
            const key = callback(value, index);
            obj[key] = [...((_a = obj[key]) !== null && _a !== void 0 ? _a : []), value];
            return obj;
        }, {});
    }
    ObjectPolyfill.groupBy = groupBy;
})(ObjectPolyfill || (ObjectPolyfill = {}));
installPolyfill(Object, ObjectPolyfill);
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
class Token {
    constructor(name, value, pos) {
        this.name = name;
        this.value = value;
        this.pos = pos;
    }
}
//`which sjs` <(mtsc -po- -tes2018 -Ilib $0) $@; exit $?
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
    static isNonTerminal(string) {
        return !this.isEOF(string) && !this.isLambda(string) && string.toLowerCase() !== string && string.length >= 1;
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
                    const [G, I] = this.followSet(lhs, T);
                    F.takeUnion(G);
                }
            }
        }
        return [F, T];
    }
    predictSet([lhs, rhs]) {
        const F = this.firstSet(rhs)[0];
        if (rhs.every(x => this.derivesToLambda(x))) {
            [...this.followSet(lhs)[0].values()].forEach(x => F.add(x));
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
}
CFG.EOF = undefined;
CFG.EOF_CHARACTER = '$';
CFG.LAMBDA_CHARACTER = '\u03bb';
class Tree {
    constructor(value) {
        _Tree_instances.add(this);
        this.value = value;
        this.children = [];
        _Tree_parent.set(this, undefined);
    }
    get parent() {
        return __classPrivateFieldGet(this, _Tree_parent, "f");
    }
    push(...items) {
        return this.children.push(...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree)));
    }
    pop() {
        return __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, this.children.pop());
    }
    unshift(...items) {
        return this.children.unshift(...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree)));
    }
    shift() {
        return __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, this.children.shift());
    }
    splice(start, deleteCount, ...items) {
        return this.children.splice(start, deleteCount, ...items.map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_own).call(this, tree))).map(tree => __classPrivateFieldGet(this, _Tree_instances, "m", _Tree_disown).call(this, tree));
    }
    at(index) {
        return this.children.at(index);
    }
    get length() {
        return this.children.length;
    }
    forEach(callbackfn, thisArg) {
        if (thisArg !== undefined) {
            callbackfn = callbackfn.bind(thisArg);
        }
        return this.children.forEach((tree, index) => callbackfn(tree, index, this));
    }
    values() {
        return this.children.values();
    }
    get [(_Tree_parent = new WeakMap(), _Tree_instances = new WeakSet(), _Tree_disown = function _Tree_disown(other) {
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
    }, Symbol.toStringTag)]() {
        return 'Tree';
    }
    get [Symbol.iterator]() {
        return this.children[Symbol.iterator];
    }
}
function createAsyncPeekableIterator(asyncIterable) {
    let next = asyncIterable[Symbol.asyncIterator]().next();
    const it = (async function* () {
        let done = false, value;
        while (!done) {
            ({ done, value } = await next);
            if (!done) {
                next = asyncIterable[Symbol.asyncIterator]().next();
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
    let next = iterable[Symbol.iterator]().next();
    const it = (function* () {
        let done = false, value;
        while (!done) {
            ({ done, value } = next);
            if (!done) {
                next = iterable[Symbol.iterator]().next();
                yield value;
            }
        }
    })();
    it.peek = function peek() {
        return next.value;
    };
    return it;
}
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
    class LL1Parser extends EventTarget {
        constructor(cfg) {
            super();
            this.cfg = transform(cfg);
            this.parseTable = createParseTable(this.cfg);
        }
        getCFG() {
            return this.cfg;
        }
        getParseTable() {
            return this.parseTable;
        }
        parse(tokens) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const LLT = this.parseTable;
            const P = this.cfg.getRuleList();
            const ts = createPeekableIterator(tokens);
            const MARKER = Symbol();
            const T = new Tree(undefined);
            const K = [];
            let Current = T;
            K.push(this.cfg.startingSymbol);
            while (K.length) {
                let x = K.pop();
                if (x === MARKER) {
                    // Hold a reference to the current parrent
                    const parent = Current.parent;
                    // Dispatch event
                    const event = new LL1Parser.CompleteNodeEvent(parent.pop());
                    this.dispatchEvent(event);
                    // Restore connections
                    if (event.node != null) {
                        parent.push(event.node);
                    }
                    Current = parent;
                }
                else if (CFG.isNonTerminal(x)) {
                    let p = P[(_c = (_a = LLT.get(x)) === null || _a === void 0 ? void 0 : _a.get((_b = ts.peek()) === null || _b === void 0 ? void 0 : _b.name)) !== null && _c !== void 0 ? _c : throws(new Error(`Syntax Error: Unexpected token ${(_e = (_d = ts.peek()) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : 'EOF'}`))];
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
                    const n = new Tree(x);
                    Current.push(n);
                    Current = Current.at(-1);
                }
                else if (CFG.isTerminalOrEOF(x) || CFG.isLambda(x)) {
                    if (CFG.isTerminalOrEOF(x)) {
                        if (x !== ((_f = ts.peek()) === null || _f === void 0 ? void 0 : _f.name)) {
                            throw new Error(`Syntax Error: Unexpected token ${(_h = (_g = ts.peek()) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : 'EOF'} expected ${x}`);
                        }
                        x = ts.shift();
                    }
                    Current.push(new Tree(x !== null && x !== void 0 ? x : CFG.EOF_CHARACTER));
                }
            }
            if (T.length !== 1) {
                throw new Error(`Syntax Error`);
            }
            return T.pop();
        }
    }
    LL1.LL1Parser = LL1Parser;
    (function (LL1Parser) {
        class CompleteNodeEvent extends Event {
            constructor(node) {
                super(CompleteNodeEvent.type);
                this.node = node;
            }
        }
        CompleteNodeEvent.type = 'completenode';
        LL1Parser.CompleteNodeEvent = CompleteNodeEvent;
    })(LL1Parser = LL1.LL1Parser || (LL1.LL1Parser = {}));
})(LL1 || (LL1 = {}));
var LL1Parser = LL1.LL1Parser;
var RegexEngine;
(function (RegexEngine) {
    const GRAMMAR = CFG.fromString(new TextDecoder().decode(new Uint8Array([
        0x53, 0x20, 0x2d, 0x3e, 0x20, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x24, 0xd, 0xa, 0xd, 0xa, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0xd, 0xa, 0xd, 0xa, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x2d, 0x3e, 0x20, 0x41, 0x6c, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x25, 0x7c, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0xd, 0xa, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0x20, 0x2d, 0x3e, 0x20, 0x53, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x65, 0x20, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0x20, 0x7c, 0x20, 0xffffffce, 0xffffffbb, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0xd, 0xa, 0x51, 0x75, 0x61, 0x6e, 0x74, 0x69, 0x66, 0x69, 0x65, 0x72, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x25, 0x2a, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x25, 0x2b, 0xd, 0xa, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x7c, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0xd, 0xa, 0xd, 0xa, 0x50, 0x72, 0x69, 0x6d, 0x61, 0x72, 0x79, 0x20, 0x2d, 0x3e, 0x20, 0x50, 0x72, 0x69, 0x6d, 0x69, 0x74, 0x69, 0x76, 0x65, 0x20, 0x7c, 0x20, 0x25, 0x28, 0x20, 0x52, 0x65, 0x67, 0x65, 0x78, 0x20, 0x25, 0x29, 0xd, 0xa, 0x50, 0x72, 0x69, 0x6d, 0x69, 0x74, 0x69, 0x76, 0x65, 0x20, 0x2d, 0x3e, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x7c, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x25, 0x2d, 0x20, 0x63, 0x68, 0x61, 0x72, 0x20, 0x7c, 0x20, 0x25, 0x2e
    ])));
    RegexEngine.PARSER = new LL1Parser(GRAMMAR);
    RegexEngine.PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function (event) {
        console.error(`Finalized a ${event.node.value}`);
    });
    // Remove lambdas
    RegexEngine.PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function (event) {
        if (event.node instanceof Tree && event.node.length === 1 && event.node.at(0).value === CFG.LAMBDA_CHARACTER) {
            event.node = null;
        }
    });
    // Squish tree
    RegexEngine.PARSER.addEventListener(LL1Parser.CompleteNodeEvent.type, function (event) {
        if (event.node instanceof Tree && event.node.length === 1) {
            event.node = event.node.pop();
        }
    });
    function isHex(text) {
        return text.split('').every(c => '0123456789abcdef'.includes(c.toLowerCase()));
    }
    function* tokenize(text) {
        const iter = text[Symbol.iterator]();
        let c;
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
                                yield new Token('char', e);
                                break;
                            case 's':
                                yield new Token('char', ' ');
                                break;
                            case 'n':
                                yield new Token('char', '\n');
                                break;
                            case 'u':
                                const hex = iter.take(4).toArray().join('');
                                const n = Number.parseInt(hex, 16);
                                if (hex.length != 4 || !isHex(hex) || Number.isNaN(n)) {
                                    throw new Error(`Invalid unicode escape sequence '\\u${hex}'`);
                                }
                                yield new Token('char', String.fromCharCode(n));
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
                    yield new Token('%' + c, c);
                    break;
                default:
                    yield new Token('char', c);
                    break;
            }
        }
    }
    RegexEngine.tokenize = tokenize;
    function parse(text) {
        return RegexEngine.PARSER.parse(tokenize(text));
    }
    RegexEngine.parse = parse;
})(RegexEngine || (RegexEngine = {}));
RegexEngine.PARSER.addEventListener('completenode', function (event) {
    const node = event.node;
    if (node instanceof Tree) {
    }
});
if (system.args.length == 2) {
    console.log(JSON.stringify(RegexEngine.parse(system.args[1]), undefined, 2));
}
else {
    throw new Error('Expected one regex argument!');
}
