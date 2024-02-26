function readNFA(path: string): NFA {
    const nfa: Partial<NFA> = {transitions: []};
    let isHeader = true;
    const text = system.readFile(path);
    if(!text) throw new Error(`${path} is empty`);
    for(const line of text.split('\n').map(x=>x.replace('\r',''))) {
        if(line.startsWith('#') || !line.trim())
            continue;

        const fields = line.split(' ').filter(x=>x);
        if(isHeader) {
            const [numStates, lambdaChar, ...alphabet] = fields;
            nfa.numStates = +numStates;
            nfa.lambdaChar = lambdaChar as char;
            nfa.alphabet = alphabet as char[];
        } else {
            const [isAccepting, from, to, ...characters] = fields;
            nfa.transitions?.push({
                isAccepting: isAccepting === '+',
                from: +from,
                to: +to,
                characters: characters as char[]
            });
        }
        isHeader = false;
    }

    return nfa as Required<NFA>;
}

function writeDFA(path: string, dfa: DFA) {
    const text = dfa.states.map(state =>
        `${state.isAccepting ? '+' : '-'} ${state.id} ${state.transitions.map(s=>s!=null?s:'E').join(' ')}`
    ).join('\n');

    system.writeFile(path,text);
}
