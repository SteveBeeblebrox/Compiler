///#pragma once
type CFG = {
    rules: Map<NonTerminal,CFGRuleSet>
    startingSymbol: string
    terminals: Set<string>
}

type NonTerminal = string;
type Terminal = string;
type CFGRuleSet = CFGRule[];
type CFGRule = string[];

type Stack<T> = {
    push(t:T): void,
    pop(): T | undefined,
    length: number
}

type SearchableStack<T> = Stack<T> & {
    includes(t: T): boolean
}