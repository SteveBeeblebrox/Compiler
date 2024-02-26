type char = '!'|'"'|'#'|'$'|'%'|'&'|"'"|'('|')'|'*'|'+'|','|'-'|'.'|'/'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|':'|';'|'<'|'='|'>'|'?'|'@'|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'|'['|'\\'|']'|'^'|'_'|'`'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'{'|'|'|'}'|'~';

type NFA = {
    numStates: number,
    lambdaChar: char,
    alphabet: char[],
    transitions: NFATransition[]
}

type NFATransition = {
    isAccepting: boolean,
    from: number,
    to: number,
    characters: char[]
}

type NFAStateIdentifier = number;

type DFA = {
    alphabet: char[],
    states: DFATransitionTable
}

type DFATransitionTable = DFAState[]

type DFAState = {
    id: DFAStateIdentifier,
    isAccepting: boolean,
    isStart: boolean,
    // Parallel to DFA alphabet
    transitions: (number|null)[]
}

type DFAStateIdentifier = number;

type Stack<T> = {
    push(t:T): void,
    pop(): T | undefined,
    length: number
}