#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee czar.js) "$@"; exit $?

///#pragma once
///#include <compat.ts>

///#include "zlang.ts"

namespace CodeGen {
    
}


namespace CZAR {
    import Nodes = ZLang.Nodes;
    const [regs='4,4',ast,output] = system.args.slice(1);
    const [RN,RF] = regs.split(',').map(x=>+x);

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

    const name = 'cgldata-1'//'fltexpr-3'//'cgldata-1';
//
    // const AST = ZLang.applySemantics(ZLang.parse(`emit(1);`));
    const AST = ZLang.applySemantics(ZLang.parse(system.readTextFileSync(`data/dist/tests/${name}.src`)));
    dump('parsed', AST);
    system.writeTextFileSync('out.czr', AST.compile({regCount: new ZLang.ASM.RegisterCount(RN,RF)}).join('\n'));
    

    // dump('restored',read(`data/dist/tests/${name}.def`));


    // For a language with instruction `op rd,rs1,rs2,rs3,...,rsn` there must be n ancilla hardware registers
    // Blaster lang needs at least two
    
}
