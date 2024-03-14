console.clear()

const z = {z:undefined as any};
z.z=z;

const w = [] as any[];
w.push(w)

const j = function(){console.log(1)}

const foo = {a: 1, c: '@Set [[1,3,2]]', d: NaN, e: -Infinity, f: undefined,g: 12n,h: Symbol('foo'), b: new Set([1,3,2]), i: new Map(Object.entries({a:1,b:2})), [Symbol('foo')]: true, /*k: function k() {console.log(this.b)},*/ x:{z}, v:[w], /*omega: j, zeta: j*/}

/**
 * We need two types of serialization,
 * equality - we want to include at least unique symbols and maybe functions, keys should be sorted, used in Sets and Maps
 * storage - functions and unique symbols cannot be accurately restored, don't sort keys, must be deserializable (we cold restore well known symbols)
 *           throw on other unique symbols
 */
namespace Serialization {
    const symbolSet = new Set<symbol>();

    export type SerializeOptions = Partial<{sortKeys: boolean, space: string | number, includeFunctions: boolean}>
    export type SerializableObject = {[toSerializable]: <T,>(this: T, options: SerializeOptions)=>SerializableValue};
    export type SerializableValue = number | boolean | string | null | bigint | undefined | symbol | SerializableValue[] | {[key: string]: SerializableValue} | SerializableObject;
    
    //export type SerializableObjectWithFunctions = {[toSerializable]: <T,>(this: T, options: SerializeOptions)=>SerializableValue};
    //export type SerializableValueWithFunctions = number | boolean | string | null | bigint | undefined | symbol | Function | SerializableValueWithFunctions[] | {[key: string]: SerializableValueWithFunctions} | SerializableObjectWithFunctions;
    //export function serialize(value: SerializableValue, options?: SerializeOptions): string;
    //export function serialize(value: SerializableValueWithFunctions, options: SerializeOptions & {includeFunctions: true}): string;
    
    export type JSONValue = number | boolean | string | null | JSONValue[] | {[key: string]: JSONValue}

    export const toSerializable = Symbol('Serialization.toSerializable');

    function getSymbolEntries<T extends {[key: PropertyKey]: any}>(obj: T): [symbol, T[symbol]][] {
        return Object.getOwnPropertySymbols(obj).map(sym => [sym,obj[sym]])
    }

    // Todo implementations of toSerializable for Number, String, Date, etc...
    // without function support, functions in arrays become null!
    // arrayValue.filter(value => typeof value !== 'function' || options.includeFunctions) to just cut them out
    export function serialize(value: SerializableValue, options: SerializeOptions = {}): string {
        function serialize(value: SerializableValue, options: SerializeOptions = {}): string {
            const references = new Map<object| Function,PropertyKey[]>();
            function transform(value: SerializableValue, path: PropertyKey[], options: SerializeOptions): JSONValue {
                if((typeof value ==='object' && value !== null) || (typeof value === 'function' && options.includeFunctions)) {
                    if(references.has(value)) {
                        return `@&:${serialize(references.get(value), {...options,space:0})}`;
                    } else {
                        references.set(value, path)
                    }
                }

                if(Array.isArray(value)) {
                    return value.map((value,index) => transform(value,[...path,`${index}`],options));
                } else if(typeof value === 'object' && value !== null) {
                    if(toSerializable in value) return `@${Object.getPrototypeOf(value).constructor.name}:${serialize(value[toSerializable](options),{...options,space:0})}`;
                    const entries = [...getSymbolEntries(value),...Object.entries(value)].map(([key,value])=>[transform(key, [...path,key], options),transform(value, [...path,key], options)]);
                    return Object.fromEntries(options?.sortKeys ? entries.sort() : entries);
                } else if(typeof value === 'bigint') {
                    return `@bigint:${serialize(value.toString())}`;
                } else if(typeof value === 'symbol') {
                    const name = value.toString().slice(7,-1);
                    symbolSet.add(value);
                    return `@symbol:${serialize([name, Symbol.for(name) === value ? -1 : [...symbolSet.values()].indexOf(value)])}`;
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
                } else if(typeof value === 'function' && options.includeFunctions) {
                    return `@function:${value}`;
                } else {
                    return value;
                }
            }
            
            return JSON.stringify(transform(value,[],options), undefined, options?.space);
        }
        return /*zip*/(serialize(value, options));
    }
}

class SerializationMap<K extends Serialization.SerializableValue,V> implements Map<K,V>, Serialization.SerializableObject {
    private readonly base = new Map<ReturnType<typeof Serialization.serialize>,[K,V]>();
    constructor(iterable?: Iterable<readonly [K, V]> | null | undefined) {
        for(const [k,v] of iterable ?? []) {
            this.set(k,v);
        }
    }
    clear(): void {
        return this.base.clear();
    }
    delete(key: K): boolean {
        return this.base.delete(Serialization.serialize(key));
    }
    forEach(callbackfn: (value: V,key: K,map: Map<K,V>) => void,thisArg?: any): void {
        if (thisArg !== undefined) {
            callbackfn = callbackfn.bind(thisArg);
        }
        return [...this.base.values()].forEach(([k,v])=>callbackfn(v,k,this));
    }
    get(key: K): V|undefined {
        return this.base.get(Serialization.serialize(key))?.[1];
    }
    has(key: K): boolean {
        return this.base.has(Serialization.serialize(key));
    }
    set(key: K,value: V): this {
        this.base.set(Serialization.serialize(key),[key,value]);
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
        return 'SerializationMap';
    }
    [Serialization.toSerializable](options: Partial<{ sortKeys: boolean; space: string|number; includeFunctions: boolean; }>) {
        return (options.sortKeys ? [...this.entries()].sort() : [...this.entries()]) as Serialization.SerializableValue[][];
    }
}

// Note, does not yet have utility methods like union, etc...
class SerializationSet<T extends Serialization.SerializableValue> implements Set<T>, Serialization.SerializableObject {
    private readonly base = new Map<ReturnType<typeof Serialization.serialize>,T>();
    constructor(iterable?: Iterable<T> | null | undefined) {
        for(const t of iterable ?? []) {
            this.add(t);
        }
    }
    add(value: T): this {
        this.base.set(Serialization.serialize(value),value);
        return this;
    }
    clear(): void {
        return this.base.clear();
    }
    delete(value: T): boolean {
        return this.base.delete(Serialization.serialize(value));
    }
    forEach(callbackfn: (value: T,value2: T,set: Set<T>) => void,thisArg?: any): void {
        if (thisArg !== undefined) {
            callbackfn = callbackfn.bind(thisArg);
        }
        return [...this.base.values()].forEach(t=>callbackfn(t,t,this));
    }
    has(value: T): boolean {
        return this.base.has(Serialization.serialize(value));
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
        return 'SerializationSet';
    }
    [Serialization.toSerializable](options: Partial<{ sortKeys: boolean; space: string|number; includeFunctions: boolean; }>) {
        return (options.sortKeys ? [...this.values()].sort() : [...this.values()]);
    }
}

// declare interface Set<T> {
//     [Serialization.toSerializable]: Serialization.SerializableObject[typeof Serialization.toSerializable];
// }
Set.prototype[Serialization.toSerializable] = function(this: Set<any>, options: Serialization.SerializeOptions) {
    return (options.sortKeys ? [...this.values()].sort() : [...this.values()]);
}

// todo, prevent serialize from allowing map<string,function> or set<function>
// declare interface Map<K extends string,V extends Serialization.SerializableValue> {
//     [Serialization.toSerializable]: Serialization.SerializableObject[typeof Serialization.toSerializable];
// }
Map.prototype[Serialization.toSerializable] = function(this: Set<any>, options: Serialization.SerializeOptions) {
    return (options.sortKeys ? [...this.entries()].sort() : [...this.entries()]);
}


//y=Symbol('deserialize');
// function detransform(value: any): any {
//     if(typeof value === 'string' && value.startsWith('@') && !value.startsWith('@@')) {
//         const key = value.substring(1).split(' ',1)[0]
//         switch(key) {
//             case 'NaN': return NaN;
//             case 'Infinity': return Infinity;
//             case '-Infinity': return -Infinity;
//             case 'undefined': return undefined;
//         }
//     } else {
//         return value;
//     }
// }

// function deserialize(text: string): any {
//     return detransform(JSON.parse(text))
// }
console.log(Serialization.serialize(foo,{space:2,sortKeys:true,includeFunctions:false}));


const x = new SerializationSet();
x.add(new SerializationSet(['a','b']));
console.log(x.has(new SerializationSet(['a','b'])))
