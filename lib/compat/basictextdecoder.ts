///#pragma once
// TextDecoder Polyfill based off of work by
// anonyco, CC0-1.0
// https://github.com/anonyco/FastestSmallestTextEncoderDecoder
// This doesn't support all the features of the standard TextDecoder,
// but it is good enough for loading embed directives
class BasicTextDecoder {
    decode(buffer: Uint8Array): string {
        let result = '';
        for (let i = 0; i<buffer.length; i+=32768) {
            result += String.fromCharCode(...buffer.subarray(i,i+32768));
        }

        return result.replace(/[\xc0-\xff][\x80-\xbf]+|[\x80-\xff]/g, function(encoded: string) {
            const cp0 = encoded.charCodeAt(0)
            let codePoint=0x110000, i=0, result="";
            switch(cp0 >>> 4) {
                // no 1 byte sequences
                case 12:
                case 13:
                    codePoint = ((cp0 & 0x1F) << 6) | (encoded.charCodeAt(1) & 0x3F);
                    i = codePoint < 0x80 ? 0 : 2;
                    break;
                case 14:
                    codePoint = ((cp0 & 0x0F) << 12) | ((encoded.charCodeAt(1) & 0x3F) << 6) | (encoded.charCodeAt(2) & 0x3F);
                    i = codePoint < 0x800 ? 0 : 3;
                    break;
                case 15:
                    if ((cp0 >>> 3) === 30) {
                        codePoint = ((cp0 & 0x07) << 18) | ((encoded.charCodeAt(1) & 0x3F) << 12) | ((encoded.charCodeAt(2) & 0x3F) << 6) | encoded.charCodeAt(3);
                        i = codePoint < 0x10000 ? 0 : 4;
                    }
            }
            if (i) {
                if (encoded.length < i) {
                    i = 0;
                } else if (codePoint < 0x10000) { // BMP code point
                    result = String.fromCharCode(codePoint);
                } else if (codePoint < 0x110000) {
                    codePoint = codePoint - 0x10080;//- 0x10000|0;
                    result = String.fromCharCode(
                        (codePoint >>> 10) + 0xD800,  // highSurrogate
                        (codePoint & 0x3ff) + 0xDC00 // lowSurrogate
                    );
                } else {
                    i = 0; // to fill it in with INVALIDs
                }
            }
            
            for (; i < encoded.length; i++)
                result += "\ufffd"; // fill rest with replacement character
            
            return result;
        });
    }
        
}