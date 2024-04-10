#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#include <compat.ts>

// Todo, property labels on edges
namespace Graphviz {
    // Note label overrides attributs.label
    export const label = Symbol('Graphviz.label');
    export const children = Symbol('Graphviz.children');
    export const attributes = Symbol('Graphviz.attributes');

    export type Graphable = Partial<{
        [children]: Iterable<Graphable>,
        [label]: string,
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

    export function serialize(obj: Graphable, {output}: GraphvizOptions = {}): string {
        const iter = (function*() {
            let start = 0;
            while(true) yield start++;
        })();

        const nodes = new Map<Graphable,NodeName>();

        const data = []
        data.push('digraph {');

        function stringifyAttributes(attributes: GraphvizAttributes) {
            
        }

        function recurse(obj: any, parent?: NodeName) {
            if(!nodes.has(obj)) {
                nodes.set(obj,`Node${iter.shift()}`);
            }
            const name: NodeName = nodes.get(obj);

            const attributes: GraphvizAttributes = obj[Graphviz.attributes] ?? {};
            
            if(Graphviz.label in obj)
                attributes.label = obj[Graphviz.label];


            data.push(`\t${name}[${Object.entries(attributes).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join(', ')}]`);

            if(parent != null) {
                 data.push(`\t${parent}->${name}`);
            }

            for(const child of obj?.[Graphviz.children] ?? []) {
                recurse(child,name);
            }
        }

        recurse(obj);

        data.push('}');
        const text = data.join('\n');

        if(typeof output === 'string') {
            system.writeTextFileSync(output,text);
        }

        return text;
    }
}

///#if __MAIN__

function makeNode(name, ...children) {
    return {
        [Graphviz.label]: name,
        [Graphviz.children]: children,
        [Graphviz.attributes]: {
            color: 'blue'
        }
    }
}

const E = makeNode('E');
const node = makeNode('A', makeNode('B', makeNode('C'), makeNode('D'),E), E,E)

console.log(Graphviz.serialize(node));

///#endif