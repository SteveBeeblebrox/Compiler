console.clear()

function assert(a: any, b: any) {
    if(a !== b) {
        throw new Error(`Assertion failed: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
    }
}

const data = 'abcdefghijklmnopqrstuvwxyz'.split('')

const alphabetTape = new Tape<string>(Array.prototype.shift.bind(data),4);
console.log(alphabetTape.toString())
assert(alphabetTape.top(), undefined)
assert(alphabetTape.next(), 'a')
assert(alphabetTape.top(), 'a')
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'b')
console.log(alphabetTape.toString())
alphabetTape.erase()
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'c')
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'd')
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'e')
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'f')
console.log(alphabetTape.toString())
alphabetTape.rewind(2);
console.log(alphabetTape.toString())
alphabetTape.erase()
console.log(alphabetTape.toString())
alphabetTape.skip(2)
console.log(alphabetTape.toString())
assert(alphabetTape.next(), 'g')
console.log(alphabetTape.toString())
assert(alphabetTape.top(2), 'i')
console.log(alphabetTape.toString())
assert(alphabetTape.top(), 'g')
assert(alphabetTape.next(), 'h')
console.log(alphabetTape.toString())
alphabetTape.rewind(alphabetTape.length)
console.log(alphabetTape.toString())
try {
    alphabetTape.rewind(1);
    throw 0;
} catch(e) {
    if(e === 0) {
        throw new Error('Assertion failed: rewinding past end did not throw');
    }
}