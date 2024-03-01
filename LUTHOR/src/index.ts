///#include "lib/types.ts"
///#include "lib/io.ts"
///#include "lib/compat.ts"
///#include "lib/encoding.ts"

; (async function() {
    const [uFile,srcFile,outFile] = system.args.slice(1);
    console.log(readLanguageDefinition(uFile));
    // const readable = await system.createFileReadStream(srcFile)
    // const writable = await system.createFileWriteStream(outFile)
    // let data;
    // while (data = readable.read(1)) {
    //     writable.write(data)
    // }
})()