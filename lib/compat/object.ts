declare interface Object {}

namespace ObjectPolyfill {
    void 0;
}

installPolyfill(Object,ObjectPolyfill);

declare interface ObjectConstructor {
    groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]};
    hasOwn(o: object, v: PropertyKey): boolean;
    fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): {[k: string]: T};
}

namespace ObjectConstructorPolyfill {
    export function groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]} {
        return values.reduce((obj, value, index) => {
            const key = callback(value,index);
            obj[key] = [...(obj[key]??[]), value];
            return obj;
        }, {} as {[key in Key]: T[]});
    }
    export function hasOwn(o: object, v: PropertyKey): boolean {
        return Object.prototype.hasOwnProperty.call(o,v);
    }
    export function fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>): {[k: string]: T} {
        const obj = {};
        for(const [key,value] of entries) {
            obj[key] = value;
        }
        return obj;
    }
}

installPolyfill({prototype: Object} as any, ObjectConstructorPolyfill);