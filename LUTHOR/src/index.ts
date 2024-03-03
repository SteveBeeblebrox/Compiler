///#include "lib/types.ts"
///#include "lib/io.ts"
///#include "lib/compat.ts"
///#include "lib/encoding.ts"
///#include "lib/tape.ts"


; (async function() {
    try {
        const [uFile,srcFile,outFile] = system.args.slice(1);
        const language: LanguageDefinition = readLanguageDefinition(uFile); 

        console.log(language);

        const inStream = await system.createFileReadStream(srcFile);
        const outStream = await system.createFileWriteStream(outFile)
        const tape: Tape<char> = new Tape<char>(() => inStream.read(1) as char);

        let byte: char;

        let matchers: TokenMatcher[] = language.createMatchers();
        let bestMatch: [TokenType,number] | null = null;
        let line = 1;
        let col = 1;
        let bytes: char[] = []

        while(byte = tape.next()) {
            bytes.push(byte);
            
            matchers.forEach(matcher => matcher.accept(byte));

            const matcher = matchers.find(matcher => matcher.isComplete()) ?? null;

            if(matchers.every(matcher => matcher.isFailed())) {
                // console.log(tape.toString())
                if(!bestMatch) {
                    throw new Error('Language matched nothing!');
                }
                // console.log(`${bestMatch[0].name} --- ` + matchers.map(x=>`${x.getType().name}:${x.state}`).join(', '))
                outStream.write(`${bestMatch[0].name} ${alphaEncode(bestMatch[0].value ?? bytes.slice(0,bestMatch[1]).join(''))} ${line} ${col}\n`);
                matchers.forEach(matcher => matcher.reset());
                tape.rewind(bytes.length - bestMatch[1]);
                tape.erase();
                bytes = [];
                bestMatch = null;
            } else {
                bestMatch = matcher ? [matcher.getType(), bytes.length] : bestMatch;
            }

            // col++;
            // if(byte === '\n') {
            //     line++;
            //     col=1;
            // }
        }
        console.log('Got to end of file...');
        console.log(bytes)
        console.log(matchers.map(x=>`${x.getType().name}:${x.state}`).join(', '))
        console.log(bestMatch)
    } catch(e) {
        console.error(e);
        system.exit(1);
    }
})()