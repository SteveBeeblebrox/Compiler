#!/usr/bin/bash
//`which sjs` <(mtsc -po- -tes2018 -Ilib "$0") "$@"; exit $?

///#pragma once
///#include <compat.ts>
///#include <types.ts>

///#include "lex.ts"
///#include "cfg.ts"
///#include "ll1.ts"

// Usage
// math.ts in 'a**(b-c)+3' > math.json
// math.ts pre '(** (+4 5 6) (* v q t) x)' > math.json

///#if !__MAIN__
///#error math.ts is not a library!
///#endif

if(system.args.length != 3) {
    throw new Error('Invalid arguments: expected mode and experession');
}

const tokens: Token[] = system.args[2].split(/(\*\*|\w+|\d+|.)/g).filter(x=>x.trim()).map(function(text) {
    text = text.trim();
    switch(text) {
        case '+':
        case '-':
        case '*':
        case '**':
        case '%':
        case '(':
        case ')':
            return new Token('%'+text,text);
    }
    if(text.match(/^\d+$/)) {
        return new Token('num',text);
    } else if(text.match(/^\w+$/)) {
        return new Token('var',text);
    } else {
        throw new Error(`Unknown token: '${text}'`)
    }
}) ?? [];

const infixGrammar = CFG.fromString(`
    S -> SUM $
    SUM -> PRODUCT
    SUM -> SUM ADD PRODUCT
    PRODUCT -> POWER
    PRODUCT -> PRODUCT MULT POWER
    POWER -> VALUE
    POWER -> VALUE EXP POWER
    VALUE -> num
    VALUE -> var
    VALUE -> %( SUM %)
    ADD -> %+
    ADD -> %-
    MULT -> %*
    MULT -> %/
    MULT -> %%
    EXP -> %**
`);

const prefixGrammar = CFG.fromString(`
    S -> PrefixExpr $
    PrefixExpr -> %( Op Args %)
    Args -> Arg Arg MoreArgs
    MoreArgs -> Arg MoreArgs
    MoreArgs -> λ
    Arg -> num
    Arg -> var
    Arg -> PrefixExpr
    Op -> LeftOp
    Op -> RightOp
    LeftOp -> %+
    LeftOp -> %*
    RightOp -> %**
`);

let parser: LL1Parser<any>;

if('prefix'.startsWith(system.args[1])) {
    class VargOperator extends Tree<any> {
        constructor(operator: string, public args: Tree<any>[]) {
            super(operator);
        }
    }
    parser = new LL1Parser<any>(prefixGrammar, new Map(Object.entries({
        '*'(node: LL1.ParseTree<any>) {
            if(node.length === 1) {
                if(node.at(0).value === CFG.LAMBDA_CHARACTER) {
                    // Remove empty lambdas
                    return null;
                } else {
                    // Squish tree
                    return node.pop();
                }
            } else if(typeof node.value === 'string' && node.value.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            }
        },
        PrefixExpr(node) {
            return new VargOperator(node.at(1).value.value, node.at(2).splice(0,node.at(2).length));
        },
        S(node) {
            return node.shift();
        }
    })) as LL1.SyntaxTransformerMap<any>);
} else if('infix'.startsWith(system.args[1])) {
    class Operator extends Tree<any> {
        constructor(operator: string, public lhs: Tree<any>, public rhs: Tree<any>) {
            super(operator);
        }
    }
    parser = new LL1Parser<any>(infixGrammar, new Map(Object.entries({
        '*'(node: LL1.ParseTree<any>) {
            if(node.length === 1) {
                if(node.at(0).value === CFG.LAMBDA_CHARACTER) {
                    // Remove empty lambdas
                    return null;
                } else {
                    // Squish tree
                    return node.pop();
                }
            } else if(typeof node.value === 'string' && node.value.endsWith('\'')) {
                // Simplify generated nodes
                return node.splice(0,node.length);
            } else if(['SUM','PRODUCT','POWER'].includes(node.value)) {
                return new Operator(node.splice(1,1)[0].value.value, node.shift(),node.pop());
            }
        },
        S(node) {
            return node.shift();
        },
        VALUE(node) {
            if(node.length === 3) {
                return node.splice(1,1);
            } else {
                return node.shift();
            }
        }
    })) as LL1.SyntaxTransformerMap<any>);
} else {
    throw new Error(`Unknown mode: '${system.args[1]}'`);
}

console.log(JSON.stringify(parser.parse(tokens[Symbol.iterator]()),void 0,2));