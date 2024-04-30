#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib -M "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>

///#include "cfg.ts"
///#include "zlang.ts"
///#include "scanner.ts"

namespace ZLang {
    console.log('Building Scanner...');
    const SCANNER = Scanner.fromString(new BasicTextDecoder().decode(new Uint8Array([
        ///#embed "zlang.lut"
    ])), 'zlex.json.lz');
    console.log('Done!');
}
