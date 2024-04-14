declare interface Object {}

namespace ObjectPolyfill {
    void 0;
}

installPolyfill(Object,ObjectPolyfill);

declare interface ObjectConstructor {
    groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]};
    hasOwn(o: object, v: PropertyKey): boolean;
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
}

installPolyfill({prototype: Object} as any, ObjectConstructorPolyfill);