///#pragma once
///#include <compat.ts>

type Mapping<T extends Record<K, V>, K extends PropertyKey, V extends PropertyKey> = T & {[P in keyof T as T[P]]: P} & Record<keyof Object, never>;
type MappingConstructor = new <T extends Record<K, V>, K extends PropertyKey, V extends PropertyKey>(values?: T) =>Mapping<T,K,V>
const Mapping: MappingConstructor = function Mapping<T extends Record<K, V>, K extends PropertyKey, V extends PropertyKey>(values?: T): Mapping<T,K,V> {
    if(!new.target) {
        throw new TypeError(`TypeError: Class constructor ${Mapping.name} cannot be invoked without 'new'`);
    }
    return Object.defineProperties(Object.create(null), Object.fromEntries([...Object.entries(values??{}), ...Object.entries(values??{}).map(o=>o.toReversed())].map(([key, value]) => [key, {value, enumerable: true}])));
} as unknown as MappingConstructor;