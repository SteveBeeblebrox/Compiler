#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once

///#include <compat.ts>


///#include "slr1.ts"
///#include "cfg.ts"

const GRAMMAR = CFG.fromString(new BasicTextDecoder().decode(new Uint8Array([
    ///#embed "zlang.cfg"
])))

console.log(GRAMMAR.cfsm().getItemSets().size)