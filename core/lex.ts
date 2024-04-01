///#pragma once

type Position = {line: number, col: number};

class Token {
    constructor(
        public readonly name: string,
        public readonly value?: string,
        public readonly pos?: Position
    ) {}
}