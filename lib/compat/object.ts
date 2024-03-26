declare interface Object {
    groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]};
}

namespace ObjectPolyfill {
    export function groupBy<T,Key extends PropertyKey>(values: T[], callback: (element: T,index: number)=>Key): {[key in Key]: T[]} {
        return values.reduce((obj, value, index) => {
            const key = callback(value,index);
            obj[key] = [...(obj[key]??[]), value];
            return obj;
        }, {} as {[key in Key]: T[]});
    }
}

installPolyfill(Object,ObjectPolyfill);