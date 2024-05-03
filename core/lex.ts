///#pragma once

type Position = {line: number, col: number};

class Token {
    constructor(
        public readonly name: string,
        public readonly value?: string,
        public readonly pos?: Position
    ) {}
    public get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}

namespace Position {
    /**
     * offset(a,b):
     * 0 => a == b (a is the same as b) 
     * + => a < b  (a is before b)
     * - => a > b  (a is after b)
     */
    export function offset(from: Position, to: Position) {
        if(to.line !== from.line) return to.line-from.line;
        else return to.col-from.col;
    }
}