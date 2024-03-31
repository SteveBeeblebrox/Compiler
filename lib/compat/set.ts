///#pragma once
// Set Polyfill based off of work by
// Axel Rauschmayer, (c) 2021 MIT License
// https://github.com/rauschma/set-methods-polyfill
namespace SetPolyfill {
    export interface SetLike<T> {
        size: number;
        has(key: T): boolean;
        keys(): IterableIterator<T>;
    }

    export function union<T>(this: Set<T>, other: SetLike<T>): Set<T> {
        validateOther(other);
        const result = new (this.constructor as SetConstructor)<T>(this);
        for (const elem of other.keys()) {
            result.add(elem);
        }
        return result;
    }

    export function intersection<T>(this: Set<T>, other: SetLike<T>): Set<T> {
        validateOther(other);
        let smallerElems;
        let largerHas;
        if (this.size <= other.size) {
            smallerElems = this;
            largerHas = other;
        } else {
            smallerElems = other.keys();
            largerHas = this;
        }
        const result = new (this.constructor as SetConstructor)<T>();
        for (const elem of smallerElems) {
            if (largerHas.has(elem)) {
                result.add(elem);
            }
        }
        return result;
    }

    export function difference<T>(this: Set<T>, other: SetLike<T>): Set<T> {
        validateOther(other);
        const result = new (this.constructor as SetConstructor)<T>(this);
        if (this.size <= other.size) {
            for (const elem of this) {
                if (other.has(elem)) {
                    result.delete(elem);
                }
            }
        } else {
            for (const elem of other.keys()) {
                if (result.has(elem)) {
                    result.delete(elem);
                }
            }
        }
        return result;
    }

    export function symmetricDifference<T>(this: Set<T>, other: SetLike<T>): Set<T> {
        validateOther(other);
        const result = new (this.constructor as SetConstructor)<T>(this);
        for (const elem of other.keys()) {
            if (this.has(elem)) {
                result.delete(elem);
            } else {
                result.add(elem);
            }
        }
        return result;
    }

    export function isSubsetOf<T>(this: Set<T>, other: SetLike<T>): boolean {
        validateOther(other);
        for (const elem of this) {
            if (!other.has(elem)) return false;
        }
        return true;
    }

    export function isSupersetOf<T>(this: Set<T>, other: SetLike<T>): boolean {
        validateOther(other);
        for (const elem of other.keys()) {
            if (!this.has(elem)) return false;
        }
        return true;
    }

    export function isDisjointFrom<T>(this: Set<T>, other: SetLike<T>): boolean {
        validateOther(other);
        if (this.size <= other.size) {
            for (const elem of this) {
                if (other.has(elem)) return false;
            }
        } else {
            for (const elem of other.keys()) {
                if (this.has(elem)) return false;
            }
        }
        return true;
    }

    function validateOther<T>(obj: SetLike<T>): void {
        function isObject(value: unknown) {
            if (value === null) return false;
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
}

declare interface Set<T> {
    union: typeof SetPolyfill.union;
    intersection: typeof SetPolyfill.intersection;
    difference: typeof SetPolyfill.difference;
    symmetricDifference: typeof SetPolyfill.symmetricDifference;
    isSubsetOf: typeof SetPolyfill.isSubsetOf;
    isSupersetOf: typeof SetPolyfill.isSupersetOf;
    isDisjointFrom: typeof SetPolyfill.isDisjointFrom;
}

installPolyfill(Set,SetPolyfill);

// Nonstandard in-place set methods

namespace InPlaceSetPolyfill {
    function takeInPlace(f: typeof SetPolyfill.union): typeof SetPolyfill.union {
        return function<T>(this: Set<T>, other: SetPolyfill.SetLike<T>) {
            const result = f.bind(this)(other) as Set<T>;
            this.clear();
            result.forEach(t=>this.add(t));
            return this;
        }
    }
    export const takeUnion = takeInPlace(SetPolyfill.union);
    export const takeIntersection = takeInPlace(SetPolyfill.intersection);
    export const takeDifference = takeInPlace(SetPolyfill.difference);
    export const takeSymmetricDifference = takeInPlace(SetPolyfill.symmetricDifference);
}

declare interface Set<T> {
    takeUnion: typeof InPlaceSetPolyfill.takeUnion;
    takeIntersection: typeof InPlaceSetPolyfill.takeIntersection;
    takeDifference: typeof InPlaceSetPolyfill.takeDifference;
    takeSymmetricDifference: typeof InPlaceSetPolyfill.takeSymmetricDifference;
}

installPolyfill(Set,InPlaceSetPolyfill);