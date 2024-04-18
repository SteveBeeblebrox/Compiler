///#pragma once

// Array.from({length:2**7}).map((_,i)=>`'${Object.assign(Object.create(null),{34:'"',39:'\\\''})[i] ?? JSON.stringify(String.fromCharCode(i)).slice(1,-1)}'`).join(' | ')
type char = '\u0000' | '\u0001' | '\u0002' | '\u0003' | '\u0004' | '\u0005' | '\u0006' | '\u0007' | '\b' | '\t' | '\n' | '\u000b' | '\f' | '\r' | '\u000e' | '\u000f' | '\u0010' | '\u0011' | '\u0012' | '\u0013' | '\u0014' | '\u0015' | '\u0016' | '\u0017' | '\u0018' | '\u0019' | '\u001a' | '\u001b' | '\u001c' | '\u001d' | '\u001e' | '\u001f' | ' ' | '!' | '"' | '#' | '$' | '%' | '&' | '\'' | '(' | ')' | '*' | '+' | ',' | '-' | '.' | '/' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | ':' | ';' | '<' | '=' | '>' | '?' | '@' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '[' | '\\' | ']' | '^' | '_' | '`' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '{' | '|' | '}' | '~' | '';

class ScannerDefinition {
    constructor(
        public alphabet: char[] = [],
        public tokenTypes: TokenType[] = []
    ) {}
    public createMatchers() {
        return this.tokenTypes.map(tt => new TokenMatcher(tt, this.alphabet));
    }
}

class TokenType {
    constructor(
        public name: string,
        public table: TransitionTable,
        public value?: string
    ) {}
}

type TransitionTable = {accepting: boolean, data: (number|null)[]}[]

class TokenMatcher {
    private static readonly NO_MATCH = -1;
    private state: number = 0;
    constructor(
        private type: TokenType,
        private alphabet: char[]
    ) {}
    public reset() {
        this.state = 0;
    }
    public accept(byte: char) {
        if(this.state !== TokenMatcher.NO_MATCH) {
            this.state = this.type.table[this.state].data[this.alphabet.indexOf(byte)] ?? -1;
        }
    }
    public isComplete(): boolean {
        return this.state !== TokenMatcher.NO_MATCH && this.type.table[this.state].accepting;
    }
    public getType(): TokenType {
        return this.type;
    }
    public isFailed(): boolean {
        return this.state === TokenMatcher.NO_MATCH;
    }
}

type Loc = {line: number, col: number};