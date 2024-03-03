///#pragma once
///#include "encoding.ts"
class Tape<T> {
    private buffer: T[] = [];
    private index: number = -1;
    constructor(private readonly pull: ()=>T, initialCount: number = 0) {
        this.growBuffer(initialCount - 1);
    }

    private growBuffer(index: number) {
        while(this.buffer.length < index + 1) {
            this.buffer.push(this.pull());
        }
    }

    // Advance to the next value
    next() {
        this.growBuffer(++this.index);
        return this.buffer[this.index];
    }
    
    // Discard all values before the current position
    erase() {
        this.buffer.splice(0, this.index + 1); // [0,this.index]
        this.index = -1;
    }

    // Go back n entries
    rewind(n: number) {
        if(this.index - n < -1) {
            throw new Error('Cannot rewind past end of tape');
        }
        this.index -= n;
    }

    // Skip n entries (lazy)
    skip(n: number) {
        this.index += n;
    }

    // When n=0, returns the current value that the prior next() did; when n>0, acts like a n lookahead
    top(n: number = 0) {
        this.growBuffer(this.index + n);
        return this.buffer[this.index + n];
    }

    toString() {
        function escape(t: T) {
            return `'${JSON.stringify(t).slice(1,-1).replace(/'/g,'\\\'').replace(/\\"/g, '"')}'`;
        }
        return `[${[...this.buffer.slice(0,this.index+1).map(escape)].join(', ')} | ${this.buffer.slice(this.index+1).map(escape).join(', ')}]`;
    }

    // The number of items that can be rewinded back; forward length has little to no meaning
    get length() {
        return this.index + 1;
    }
}