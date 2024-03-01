///#pragma once
namespace AlphabetEncoding {
    export function decode(encoded: string): string {
        function unescape(sequence: string) {
            const n = +`0${sequence}`;
            if(Number.isNaN(n))
                throw new Error(`'${sequence}' is not a valid escape sequence!`);
            return String.fromCharCode(n);
        }
        return encoded?.replace(/x.{0,2}/g, unescape);
    }
    export function encode(text: string): string {
        function escape(char: string) {
            return `x${char.charCodeAt(0).toString(16)}`
        }
        return text?.replace(/[^0-9A-Za-wy-z]/g, escape);
    }
}

const {decode: alphaDecode, encode: alphaEncode} = AlphabetEncoding;