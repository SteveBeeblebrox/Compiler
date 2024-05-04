///#pragma once
///#include <compression.ts>
/**
 * Do NOT put mutable items in a set or use them as map keys! Bad things will happen.
 */
namespace Signature {
    // Prepopulate with well known symbols
    const symbolSet = new Set<symbol>(Object.keys(Object.getOwnPropertyDescriptors(Symbol)).flatMap(function(key) {
        const value = Symbol[key as keyof SymbolConstructor];
        if(typeof value === 'symbol' && value !== Symbol.for(value.toString().slice(7,-1))) {
            return [value];
        } else {
            return [];
        }
    }));

    export type SignatureOptions = Partial<{
        sortKeys: boolean,
        space: number,
        includeFunctions: boolean,
        preserveReferences: boolean
    }>;
    export type SignableObject<T=any> = {[toSignable]: (this: T, options: SignatureOptions, transform: (SignableValue)=>JSONValue)=>SignableValue};
    export type SignableValue = number | boolean | string | null | bigint | undefined | symbol | ((args: any[])=>any) | SignableValue[] | {[key: string]: SignableValue} | SignableObject;

    export const toSignable = Symbol('Signature.toSignable');

    export function create(value: SignableValue, options: SignatureOptions = {}): string {
        function createSignature(value: SignableValue, options: SignatureOptions = {}): string {
            const references = new Map<object| Function,PropertyKey[]>();
            function getSymbolEntries<T extends {[key: PropertyKey]: any}>(obj: T): [symbol, T[symbol]][] {
                return Object.getOwnPropertySymbols(obj).map(sym => [sym,obj[sym]])
            }
            function transform(value: SignableValue, path: PropertyKey[], options: SignatureOptions): JSONValue {
                try {
                    if((typeof value ==='object' && value !== null) || (typeof value === 'function' && options.includeFunctions && options.preserveReferences)) {
                        if(references.has(value)) {
                            return `@&:${createSignature(references.get(value), {...options,space:0})}`;
                        } else {
                            references.set(value, path)
                        }
                    }
                    
                    if(Array.isArray(value)) {
                        return value.filter(value => typeof value !== 'function' || options.includeFunctions).map((value,index) => transform(value,[...path,`${index}`],options));
                    } else if(typeof value === 'object' && value !== null) {
                        if(toSignable in value) return `@${Object.getPrototypeOf(value).constructor.name}:${createSignature(value[toSignable](options,value=>transform(value,[...path],{...options,space:0})),{...options,space:0})}`;
                        const entries = [...getSymbolEntries(value),...Object.entries(value)].map(([key,value])=>[transform(key, [...path,key], options),transform(value, [...path,key], options)]);
                        return Object.fromEntries(options?.sortKeys ? entries.sort() : entries);
                    } else if(typeof value === 'bigint') {
                        return `@bigint:${createSignature(value.toString())}`;
                    } else if(typeof value === 'symbol') {
                        const name = value.toString().slice(7,-1);
                        symbolSet.add(value);
                        return `@symbol:${createSignature([name, Symbol.for(name) === value ? -1 : [...symbolSet.values()].indexOf(value)])}`;
                    } else if(typeof value === 'string') {
                        return value.replace(/@/g,'@@');
                    } else if(Number.isNaN(value)) {
                        return '@number:NaN'
                    } else if(value === Infinity) {
                        return '@number:+Infinity'
                    } else if(value === -Infinity) {
                        return '@number:-Infinity'
                    } else if(typeof value === 'undefined') {
                        return '@undefined';
                    } else if(typeof value === 'function') {
                        return options.includeFunctions ? `@function:${value}` : void(0) as any;
                    } else {
                        return value as JSONValue;
                    }
                } finally {
                    if(typeof value === 'object' && value !== null && !options.preserveReferences) {
                        references.delete(value);
                    }
                }
            }
            
            return JSON.stringify(transform(value,[],options), undefined, Math.max(options?.space ?? 0,0));
        }
        const signature = createSignature(value, {sortKeys: true, includeFunctions: true, preserveReferences: false, ...options});
        return options.space === -1 || options.space === undefined ? LZCompression.zip(signature) : signature;
    }

    export class SignatureMap<K extends Signature.SignableValue,V> implements Map<K,V>, Signature.SignableObject {
        private readonly base = new Map<ReturnType<typeof Signature.create>,[K,V]>();
        constructor(iterable?: Iterable<readonly [K, V]> | null | undefined) {
            for(const [k,v] of iterable ?? []) {
                this.set(k,v);
            }
        }
        clear(): void {
            return this.base.clear();
        }
        delete(key: K): boolean {
            return this.base.delete(Signature.create(key));
        }
        forEach(callbackfn: (value: V,key: K,map: Map<K,V>) => void,thisArg?: any): void {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return [...this.base.values()].forEach(([k,v])=>callbackfn(v,k,this));
        }
        get(key: K): V|undefined {
            return this.base.get(Signature.create(key))?.[1];
        }
        has(key: K): boolean {
            return this.base.has(Signature.create(key));
        }
        set(key: K,value: V): this {
            this.base.set(Signature.create(key),[key,value]);
            return this;
        }
        get size(): number {
            return this.base.size;
        }
        entries(): IterableIterator<[K,V]> {
            return this.base.values();
        }
        keys(): IterableIterator<K> {
            return [...this.base.values()].map(([k,v])=>k)[Symbol.iterator]();
        }
        values(): IterableIterator<V> {
            return [...this.base.values()].map(([k,v])=>v)[Symbol.iterator]();
        }
        [Symbol.iterator](): IterableIterator<[K,V]> {
            return this.base.values();
        }
        get [Symbol.toStringTag](): string {
            return 'SignatureMap';
        }
        [Signature.toSignable](options: Partial<{ sortKeys: boolean; space: string|number; includeFunctions: boolean;}>, transform: (SignableValue)=>JSONValue) {
            return (options.sortKeys ? [...this.entries()].map(transform).sort() : [...this.entries()]) as Signature.SignableValue[][];
        }
    }

    export class SignatureSet<T extends Signature.SignableValue> implements Set<T>, Signature.SignableObject {
        private readonly base = new Map<ReturnType<typeof Signature.create>,T>();
        constructor(iterable?: Iterable<T> | null | undefined) {
            for(const t of iterable ?? []) {
                this.add(t);
            }
        }
        add(value: T): this {
            this.base.set(Signature.create(value),value);
            return this;
        }
        clear(): void {
            return this.base.clear();
        }
        delete(value: T): boolean {
            return this.base.delete(Signature.create(value));
        }
        // Different callback than pollyfill
        // @ts-expect-error
        forEach(callbackfn: (value: T,value2: T,set: SignatureSet<T>) => void,thisArg?: any): void {
            if (thisArg !== undefined) {
                callbackfn = callbackfn.bind(thisArg);
            }
            return [...this.base.values()].forEach(t=>callbackfn(t,t,this));
        }
        has(value: T): boolean {
            return this.base.has(Signature.create(value));
        }
        get size(): number {
            return this.base.size;
        }
        entries(): IterableIterator<[T,T]> {
            return [...this.base.values()].map(t => [t,t] as [T,T])[Symbol.iterator]();
        }
        keys(): IterableIterator<T> {
            return this.base.values();
        }
        values(): IterableIterator<T> {
            return this.base.values();
        }
        [Symbol.iterator](): IterableIterator<T> {
            return this.base.values();
        }
        get [Symbol.toStringTag](): string {
            return 'SignatureSet';
        }
        [Signature.toSignable](options: Partial<{ sortKeys: boolean; space: string|number; includeFunctions: boolean; }>, transform: (SignableValue)=>JSONValue) {
            return (options.sortKeys ? [...this.values()].map(transform).sort() : [...this.values()]);
        }
    }
}

import SignatureSet = Signature.SignatureSet;
import SignatureMap = Signature.SignatureMap;

declare interface Set<T> extends Signature.SignableObject<Set<T>> {}
Set.prototype[Signature.toSignable] = function(this: Set<any>, options: Signature.SignatureOptions, transform: (SignableValue)=>JSONValue) {
    return (options.sortKeys ? [...this.values()].map(transform).sort() : [...this.values()]);
}

declare interface Map<K,V> extends Signature.SignableObject<Map<K,V>> {}
Map.prototype[Signature.toSignable] = function(this: Map<any,any>, options: Signature.SignatureOptions, transform: (SignableValue)=>JSONValue) {
    return (options.sortKeys ? [...this.entries()].map(transform).sort() : [...this.entries()]);
}

declare interface Date extends Signature.SignableObject<Date> {}
Date.prototype[Signature.toSignable] = function(this: Date) {
    return this.toJSON();
}

declare interface Number extends Signature.SignableObject<Number> {}
Number.prototype[Signature.toSignable] = function(this: Number) {
    return this.valueOf();
}

declare interface Boolean extends Signature.SignableObject<Boolean> {}
Boolean.prototype[Signature.toSignable] = function(this: Boolean) {
    return this.valueOf();
}

declare interface String extends Signature.SignableObject<String> {}
String.prototype[Signature.toSignable] = function(this: String) {
    return this.toString();
}

declare interface RegExp extends Signature.SignableObject<RegExp> {}
RegExp.prototype[Signature.toSignable] = function(this: RegExp) {
    return this.toString();
}

///#include <compat.ts>
namespace Signature {
    type WithReturnAdjustment<T extends SignableValue,F> = F extends (...args: infer Args) => Set<T> ? (...args: Args) => SignatureSet<T> : F
    export declare interface SignatureSet<T extends Signature.SignableValue> {
        union: WithReturnAdjustment<T,typeof SetPolyfill.union<T>>;
        intersection: WithReturnAdjustment<T,typeof SetPolyfill.intersection<T>>;
        difference: WithReturnAdjustment<T,typeof SetPolyfill.difference<T>>;
        symmetricDifference: WithReturnAdjustment<T,typeof SetPolyfill.symmetricDifference<T>>;
        isSubsetOf: WithReturnAdjustment<T,typeof SetPolyfill.isSubsetOf<T>>;
        isSupersetOf: WithReturnAdjustment<T,typeof SetPolyfill.isSupersetOf<T>>;
        isDisjointFrom: WithReturnAdjustment<T,typeof SetPolyfill.isDisjointFrom<T>>;

        takeUnion: WithReturnAdjustment<T,typeof InPlaceSetPolyfill.takeUnion<T>>;
        takeIntersection: WithReturnAdjustment<T,typeof InPlaceSetPolyfill.takeIntersection<T>>;
        takeDifference: WithReturnAdjustment<T,typeof InPlaceSetPolyfill.takeDifference<T>>;
        takeSymmetricDifference: WithReturnAdjustment<T,typeof InPlaceSetPolyfill.takeSymmetricDifference<T>>;
    }
}
// The pollyfill is typed with this: Set<T> but will also work for this: SignatureSet<T>
//@ts-expect-error
installPolyfill(SignatureSet,SetPolyfill);
//@ts-expect-error
installPolyfill(SignatureSet,InPlaceSetPolyfill);