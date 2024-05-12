#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>

namespace Graphviz {
    // Note label overrides attributes.label which overrides using Symbol.toStringTag
    export const label = Symbol('Graphviz.label');
    export const children = Symbol('Graphviz.children');
    export const exclude = Symbol('Graphviz.exclude');
    export const attributes = Symbol('Graphviz.attributes'); // https://graphviz.org/doc/info/attrs.html

    export function text(text: string, attributes: GraphvizAttributes = {}): Graphable {
        return {...attributes, [Graphviz.label]: text};
    }

    export type Graphable = object & Partial<{
        [children]: string[] | {[key: string]: Graphable},
        [label]: string,
        [exclude]: string[],
        [attributes]: GraphvizAttributes
    }>;
    export type GraphvizAttributes = Partial<{
        label: string,
        color: string
    }>;
    export type GraphvizOptions = Partial<{
        output: string
    }>;

    type NodeName = `Node${number}`;

    function stringifyAttributes(attributes?: GraphvizAttributes) {
        return attributes ? `[${Object.entries(attributes).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join(', ')}]` : '';
    }

    export function serialize(obj: Graphable, {output}: GraphvizOptions = {}): string {
        const iter = (function*() {
            let start = 0;
            while(true) yield start++;
        })();

        const nodes = new Map<Graphable,NodeName>();

        const data = [];
        data.push('digraph {');

        function recurse(parent: NodeName | undefined, edge: string | undefined, obj: any): NodeName {
            if(typeof obj !== 'object' || obj === null)
                return;
            
            if(!nodes.has(obj)) {
                nodes.set(obj,`Node${iter.shift()}`);
            }
            
            const name: NodeName = nodes.get(obj);

            const excluded = new Set(obj[Graphviz.exclude] ?? []);

            const attributes: GraphvizAttributes = obj[Graphviz.attributes] ?? {};
            
            if(Graphviz.label in obj)
                attributes.label = obj[Graphviz.label];

            attributes.label ??= Symbol.toStringTag in obj ? obj[Symbol.toStringTag] : Object.prototype.toString.apply(obj);


            data.push(`\t${name}${stringifyAttributes(attributes)}`);

            if(parent != null) {
                data.push(`${parent}->${name}${stringifyAttributes({label: edge})}`);
            }

            const keys: string[] | object = obj[Graphviz.children] ?? Object.keys(obj);

            for(const [key, child] of Array.isArray(keys) && Array.isArray(keys[0]) ? keys : Object.entries(Array.isArray(keys) ? obj : keys)) {
                if(excluded.has(key)) {
                    continue;
                }
                if(!Array.isArray(keys) || keys.includes(key) || Array.isArray(keys[0])) {
                    if(Array.isArray(child)) {
                        for(const [i,arrayChild] of Array.entries(child)) {
                            recurse(name,`${key}[${i}]`,arrayChild);
                        }
                    } else {
                        recurse(name,key,child);
                    }
                }
            }
        }

        recurse(null,null,obj);

        data.push('}');
        const text = data.join('\n');

        if(typeof output === 'string') {
            system.writeTextFileSync(output,text);
        }

        return text;
    }
}