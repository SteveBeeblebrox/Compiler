///#pragma once
///#include <compat.ts>
///#include <types.ts>
///#include <zlang.ts>


///<reference path="../../../lib/compat.ts"/> // Make VS Code happy 
///<reference path="../../../lib/types.ts"/> // Make VS Code happy
///<reference path="../../../lib/encoding.ts"/> // Make VS Code happy
///<reference path="../../../core/lex.ts"/> // Make VS Code happy
///<reference path="../../../core/zlang.ts"/> // Make VS Code happy
///<reference path="../../../lib/graphviz.ts"/> // Make VS Code happy

;(function() {
    const [regs='4,4',def,output=def.replace(/\..*?$/,'.czr')] = system.args.slice(1);
    const [RN,RF] = regs.split(',').map(x=>+x);

    // Validate that .def file is readable
    void system.readTextFileSync(def);
    system.writeTextFileSync(output, ZLang.compile(
        system.readTextFileSync(def.replace(/\.def$/,'.src')),
        {regCount: new ZLang.ASM.RegisterCount(RN,RF)}
    ));
})();
