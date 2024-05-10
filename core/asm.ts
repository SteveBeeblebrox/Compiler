///#pragma once

///#include <compat.ts>

namespace ASM {
    export type Address = `@${number}${Alignment}`;
    export type Instruction = '' | `#${string}` | string;
    export type Alignment = 'w' | 'f' | 'i' | 'b';
    abstract class AbstractRegister {
        public constructor(public readonly name: string) {}
        public toString(): string {
            return this.name;
        }
        public abstract toASM(i: number): string;

    }
    export class Register extends AbstractRegister {
        toASM() {
            return this.name;
        }
    }
    export class VirtualRegister extends AbstractRegister {
        toASM(i: number) {
            return `w${i}`;
        }
    }

    export class CompileContext {

    }
    export function domainToAlignment(domain: ZLang.Domain): Alignment {
        switch(domain) {
            case 'bool':
            case 'string':
                return 'b';
            case 'float':
                return 'f'
            case 'int':
                return 'w';
        }
    }
    export function alignmentToBytes(alignment: Alignment) {
        switch(alignment) {
            case 'b':
                return 1;
            case 'w':
            case 'f':
            case 'i':
                return 4;
        }
    }

    type InstructionArgument = AbstractRegister | {read:AbstractRegister} | {write:AbstractRegister} | {raw:string} | Address | number | bigint;
    export function inst(strings: TemplateStringsArray, ...args: InstructionArgument[]): string[] {
        const virtualReads = new Map<string,string>(), virtualWrites = new Map<string,string>();
        let instruction = '';
        let n = 0;

        for(const [i,s] of strings.entries()) {
            const arg = (function f(arg) {
                if(arg instanceof AbstractRegister) {
                    return f({read:arg});
                } else if(typeof arg === 'object' && arg !== null) {
                    const {read,write,raw}:{read?:AbstractRegister,write?:AbstractRegister,raw?:string} = arg;
                    
                    if('toASM' in arg && typeof arg.toASM === 'function') {
                        return arg.toASM();
                    }
                    
                    if(raw) {
                        return raw;
                    }
                    
                    if(write) {
                        if(write instanceof VirtualRegister && !virtualWrites.has(write.name)) {
                            virtualWrites.set(write.name,write.toASM(n++));
                        }
                        return virtualWrites.get(write.name)??write.toASM(n++);
                    }

                    if(read) {
                        if(read instanceof VirtualRegister && !virtualReads.has(read.name)) {
                            virtualReads.set(read.name,read.toASM(n++));
                        }
                        return virtualReads.get(read.name)??read.toASM(n++);
                    }
                } else if(typeof arg === 'number') {
                    return ZLang.Nodes.FloatLiteral.toASM(arg);
                } else if(typeof arg === 'bigint') {
                    return ZLang.Nodes.IntLiteral.toASM(arg);
                }
                return arg;
            })(args[i]);
            
            instruction+=s + (arg??'');
        }

        return [
            ...virtualReads.entries().map(([v,w])=>`#${v}->${w}`),
            instruction,
            ...virtualWrites.entries().map(([v,w])=>`#${w}->${v}`)
        ];
    }

}