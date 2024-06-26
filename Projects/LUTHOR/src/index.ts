///#include "lib/types.ts"
///#include "lib/io.ts"
///#include "lib/compat.ts"
///#include "lib/encoding.ts"
///#include "lib/tape.ts"


; (async function() {
    try {
        const [uFile,srcFile,outFile] = system.args.slice(1);
        const scanner: ScannerDefinition = readScannerDefinition(uFile); 

        const inStream = await system.createFileReadStream(srcFile);
        const outStream = await system.createFileWriteStream(outFile)
        const tape: Tape<char> = new Tape<char>(() => inStream.read(1) as char);

        let byte: char | undefined;

        let matchers: TokenMatcher[] = scanner.createMatchers();
        let bestMatch: [TokenType,number,end:Loc] | null = null;
        let currentPos = {line: 1, col: 1}
        let startPos: Loc = {...currentPos};
        let bytes: char[] = [];

        while(byte = tape.next() || bytes.length) {
            if(byte) {
                bytes.push(byte);
                matchers.forEach(matcher => matcher.accept(byte!));
            }
            
            const matcher = matchers.find(matcher => matcher.isComplete()) ?? null;

            if(matchers.every(matcher => matcher.isFailed()) || !byte) {
                if(!bestMatch) {
                    throw new Error('Language matched nothing!');
                }
                outStream.write(`${bestMatch[0].name} ${alphaEncode(bestMatch[0].value ?? bytes.slice(0,bestMatch[1]).join(''))} ${startPos.line} ${startPos.col}\n`);
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
    } catch(e) {
        console.error(e);
        system.exit(1);
    }
})()