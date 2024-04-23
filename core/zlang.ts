#!/usr/bin/bash
//`which sjs` --debug <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>


///#include "slr1.ts"
///#include "cfg.ts"

const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.cfg"
])));

console.log('Building parser...')

///#include <encoding.ts>


const tokens = new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "../data/zlang.tok"
])).split('\n').map(x=>x.split(' ')).map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}));

const PARSER = new SLR1.SLR1Parser(GRAMMAR);

async function dump(name: string, node: Tree) {
    //@ts-ignore
    const dot = new system.Command('dot', {
        args: ['-Tpng', `-odata/${name}.png`],
        stdin: 'piped'
    }).spawn();
    
    const writer = dot.stdin.getWriter()
    await writer.write(new TextEncoder().encode(Graphviz.serialize(node)));
    await writer.ready;
    await writer.close();
}
console.log('Parsing...')
dump('zlang', PARSER.parse(tokens));