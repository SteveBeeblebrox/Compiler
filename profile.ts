///#pragma once

// Does not work on old node!

namespace Profile {
    const starts = new Map<string,number>();
    const data = new Map<string,number[]>();
    export function start(name: string) {
        starts.set(name,performance.now());
    }
    export function end(name: string) {
        const dt = performance.now() - (starts.get(name) ?? 0);
        if(!data.has(name)) data.set(name, [dt]);
        else data.get(name)!.push(dt);
        return dt;
    }
    export function get(name: string) {
        const dts = data.get(name) ?? [];
        return {
            name,
            average: dts.reduce((a,b)=>a+b,0)/dts.length,
            max: Math.max(...dts)
        }
    }
    export function getAll() {
        //@ts-ignore
        return data.keys().map(names=>Profile.get(names)).toArray();
    }
}