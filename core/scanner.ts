///#pragma once

///#include <compat.ts>

///#include "regex.ts"

class Scanner {
    private constructor(public readonly alphabet: ReadonlySet<char>, private readonly lambdaChar: char, private readonly patterns: Map<string,{dfa:FiniteAutomata.DFA,value:string}>) {}
    public static fromString(text: string, cache?: string): Scanner {
        // Try to load from cache
        try {
            if(cache !== undefined) {
                const {signature,alphabet,patterns,lambdaChar} = JSON.parse(LZCompression.decompressFromUint8Array(system.readFileSync(cache)));
                if(Signature.create(text) === signature) {
                    return new Scanner(
                        new Set(alphabet),
                        lambdaChar,
                        new Map(
                            patterns.map(([k,{dfa,value}])=>[k,{dfa: new Map(dfa.map(([k,{entries,props}])=>[k,Object.assign(new Map(entries),props)])),value}])
                        )
                    );
                }
            }
        } catch(e) {}

        const lines = text.split('\n').map(line => line.trim()).filter(line=>line && !line.startsWith('#'));
        const alphabet = new Set(lines.shift()!.split(/\s+/g).flatMap(x=>alphaDecode(x).split('')));

        const lambdaCharacter: char = (function(alphabet: Set<char>) {
            for(const c of range(String.fromCharCode(1), String.fromCharCode(127))) {
                if(!alphabet.has(c)) return c;
            }
            throw new Error('No sutible lambda ascii character found!');
        })(new Set(alphabet));

        const patterns = new Map();
        const ctx =  new FiniteAutomata.NFAContext(alphabet);

        for(const line of lines) {
            const [regex,name,value] = line.split(/\s+/g);

            // console.debug(`Compiling regex ${name}...`)

            const nfa = RegexEngine.compile(regex,alphabet);
            const dfa = FiniteAutomata.optimizeDFA(FiniteAutomata.toDFA(nfa,ctx),ctx);

            patterns.set(name, {
                dfa, value: value ?? undefined
            });
        }

        const scanner = new Scanner(alphabet, lambdaCharacter, patterns);
        
        // Save to cache
        try {
            if(cache !== undefined) {
                system.writeFileSync(cache,LZCompression.compressToUint8Array(JSON.stringify({
                    signature: Signature.create(text),
                    alphabet: [...scanner.alphabet],
                    patterns: scanner.patterns.entries().map(([k,{dfa,value}]) => [k,{dfa:dfa.entries().map(([k,v])=>[k,{entries:v.entries().toArray(),props:{...v}}]).toArray(),value}]).toArray(),
                    lambdaCharacter
                })));
            }
        } catch(e) {}

        return scanner;
    }

    *tokenize(iter: Iterator<char>) {
        type TokenType = {name: string, value?:string};
        class TokenMatcher {
            private static readonly NO_MATCH = -1;
            private state: FiniteAutomata.DFAState | typeof TokenMatcher.NO_MATCH = 0 as FiniteAutomata.DFAState;
            constructor(
                private readonly type: TokenType,
                private readonly dfa: FiniteAutomata.DFA
            ) {}
            public reset() {
                this.state = 0 as FiniteAutomata.DFAState;
            }
            public accept(byte: char) {
                if(this.state !== TokenMatcher.NO_MATCH) {
                    this.state = this.dfa.get(this.state).get(byte) ?? TokenMatcher.NO_MATCH;
                }
            }
            public isComplete(): boolean {
                return this.state !== TokenMatcher.NO_MATCH && this.dfa.get(this.state)?.accepting;
            }
            public getType(): TokenType {
                return this.type;
            }
            public isFailed(): boolean {
                return this.state === TokenMatcher.NO_MATCH;
            }
        }

        const tape: Tape<char> = new Tape(iter);
        let byte: char | undefined;

        let matchers: TokenMatcher[] = this.patterns.entries().map(([name,{value,dfa}]) => new TokenMatcher({name,value},dfa)).toArray();
        let bestMatch: [TokenType,number,end:Position] | null = null;
        let currentPos = {line: 1, col: 1}
        let startPos: Position = {...currentPos};
        let bytes: char[] = [];

        while((byte = tape.next()) || bytes.length) {
            if(byte !== undefined && !this.alphabet.has(byte)) {
                throw new Parsing.LexError(`Unexpected character '${JSON.stringify(byte).slice(1,-1).replace(/'/g,'\\\'').replace(/\\"/g,'"')}'`,currentPos);
            }

            if(byte) {
                bytes.push(byte);
                matchers.forEach(matcher => matcher.accept(byte!));
            }
            
            const matcher = matchers.find(matcher => matcher.isComplete()) ?? null;
            
            if(matchers.every(matcher => matcher.isFailed()) || !byte) {
                if(!bestMatch) {
                    throw new Parsing.LexError('Language matched nothing!',currentPos);
                }
                
                if(bestMatch[0].name.toUpperCase() !== bestMatch[0].name) {
                    yield new Token(bestMatch[0].name, bestMatch[0].value ?? bytes.slice(0,bestMatch[1]).join(''), {...startPos});
                }

                matchers.forEach(matcher => matcher.reset());
                tape.rewind(bytes.length - bestMatch[1]);
                tape.erase();
                bytes = [];
                startPos = bestMatch[2];
                currentPos = {...startPos};
                bestMatch = null;
            } else {
                currentPos.col++;
                if(byte === '\n') {
                    currentPos.line++;
                    currentPos.col=1;
                }
                bestMatch = matcher ? [matcher.getType(), bytes.length, {...currentPos}] : bestMatch;
            }
        }
    }
}