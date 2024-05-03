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
     * 0 => a==b;
     * + => a < b
     * - => a > b
     */
    export function offset(from: Position, to: Position) {
        if(to.line !== from.line) return to.line-from.line;
        else return to.col-from.col;
    }
}