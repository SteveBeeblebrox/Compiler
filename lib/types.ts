///#pragma once
type char = '\u0000' | '\u0001' | '\u0002' | '\u0003' | '\u0004' | '\u0005' | '\u0006' | '\u0007' | '\b' | '\t' | '\n' | '\u000b' | '\f' | '\r' | '\u000e' | '\u000f' | '\u0010' | '\u0011' | '\u0012' | '\u0013' | '\u0014' | '\u0015' | '\u0016' | '\u0017' | '\u0018' | '\u0019' | '\u001a' | '\u001b' | '\u001c' | '\u001d' | '\u001e' | '\u001f' | ' ' | '!' | '"' | '#' | '$' | '%' | '&' | '\'' | '(' | ')' | '*' | '+' | ',' | '-' | '.' | '/' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | ':' | ';' | '<' | '=' | '>' | '?' | '@' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '[' | '\\' | ']' | '^' | '_' | '`' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | '{' | '|' | '}' | '~' | '';

declare interface String {
    split(s: ''): char[];
    [Symbol.iterator](): IterableIterator<char>;
}

declare namespace OpaqueTypes {
    const type: unique symbol;
    export type Opaque<T,Ident> = T & {[type]:Ident};
}
type Opaque<T,Ident> = OpaqueTypes.Opaque<T,Ident>;

type Stack<T> = {
    push: Array<T>['push'],
    pop: Array<T>['pop'],
    length: Array<T>['length'],
    [Symbol.iterator]: Array<T>[typeof Symbol.iterator]
}

type JSONPrimitive = number | boolean | string | null;
type JSONObject = {[key: string]: JSONValue};
type JSONArrray = JSONValue[];
type JSONValue = JSONPrimitive | JSONArrray | JSONObject

type Constructor<ParameterTypes extends any[],ThisType>=new(...args: ParameterTypes)=>ThisType;