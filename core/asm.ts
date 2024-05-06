#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee zlang.js) "$@"; exit $?

///#pragma once
///#include <compat.ts>

///#include "zlang.ts"

namespace CodeGen {
    
}


namespace CZAR {
    import Nodes = ZLang.Nodes;
    const [regs='4,4',ast,output] = system.args.slice(1);
    const [RN,RF] = regs.split(',').map(x=>+x);

    function read(path: string): ZLang.Program {
        // const srcText = system.readTextFileSync(path);

        // const [nodeLines,connectionLines] = srcText.trim().split('\n\n').map(x=>x.trim().split('\n').map(x=>x.trim()).filter(x=>!x.startsWith('#')));

        // const nodes = new Map<string,Parsing.ParseTreeNode>();

        // for(const nodeText of nodeLines) {
        //     const [id,pl,nodeType,...data] = nodeText.split(' ');
        //     console.log(id,nodeType)
        //     nodes.set(id, pl === 'leaf' ? new Parsing.ParseTreeTokenNode(alphaDecode(nodeType) as Terminal, data[0].slice(1)));
        // }

        // console.log(nodes)

        // throw new Error();
    }

    async function dump(name: string, node: Tree, {format = 'png'} = {}) {
        //@ts-ignore
        const dot = new system.Command('dot', {
            args: [`-T${format}`, `-odata/${name}.${format}`],
            stdin: 'piped'
        }).spawn();
        
        const text = Graphviz.serialize(node);
        system.writeTextFileSync(`data/${name}.dot`,text);
    
        const writer = dot.stdin.getWriter()
        await writer.write(new TextEncoder().encode(text));
        await writer.ready;
        await writer.close();
    }

    const name = 'cgldata-1';

    const AST = ZLang.applySemantics(ZLang.parse(system.readTextFileSync(`data/dist/tests/${name}.src`)));

    for(const statement of AST.statements) {
        if(statement instanceof Nodes.StatementNode) {
            
        }
    }

    dump('parsed', AST);
    // dump('restored',read(`data/dist/tests/${name}.def`));


    // For a language with instruction `op r1,r2,r3,...,rn` there must be n work registers
    // Blaster lang needs at least three
    class AbstractRegister {

    }

    class RegisterManager {

    }
}