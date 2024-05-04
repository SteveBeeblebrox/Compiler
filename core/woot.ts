#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0" | tee woot.js) "$@"; exit $?

///#pragma once

///#include <compat.ts>

///#include "zlang.ts"

///#if __MAIN__
console.log('Tokens:')
console.log(ZLang.tokenize(`
int x = y = z = 3;
float k;
float m = n = k = 3.14;

`).map(x=>JSON.stringify(x)).toArray().join('\n'))
///#endif