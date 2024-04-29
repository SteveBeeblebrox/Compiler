#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>


///#include "slr1.ts"
///#include "cfg.ts"

///#include <signature.ts>
///#include <encoding.ts>

const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.cfg"
])));

console.log('Building parser...');

namespace ZLang {
    namespace TreeNodes {
        export abstract class ZNode extends Tree {
            public readonly name = this.constructor.name;
        }
    }
    export const sdt = new Parsing.SyntaxTransformer<TreeNodes.ZNode>({
        '*'(node: Parsing.ParseTreeNode) {
            if(node.length === 1) {
                if(node.at(0) instanceof Parsing.ParseTreeLambdaNode) {
                    // Remove empty lambdas
                    return null;
                } else {
                    // Squish tree
                    return node.pop();
                }
            } else if(node.name.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            }
        },
        MODULE(node) {
            node.pop();
            return node;
        }
    });
}


const PARSER = new SLR1.SLR1Parser(GRAMMAR, ZLang.sdt, 'zlang.json');

async function dump(name: string, node: Tree, {format = 'png'} = {}) {
    //@ts-ignore
    const dot = new system.Command('dot', {
        args: [`-T${format}`, `-odata/${name}.${format}`],
        stdin: 'piped'
    }).spawn();
    
    const writer = dot.stdin.getWriter()
    await writer.write(new TextEncoder().encode(Graphviz.serialize(node)));
    await writer.ready;
    await writer.close();
}
console.log('Parsing...');
const tokens = system.readTextFileSync(system.args[1]).trim().split('\n').map(x=>x.trim().split(' ')).map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}));
dump('zlang', PARSER.parse(tokens));