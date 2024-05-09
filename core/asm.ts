///#pragma once

///#include <compat.ts>

namespace ASM {
    export type Address = `@${number}${Alignment}`;
    export type Instruction = '' | `#${string}` | string;
    export type Alignment = 'w' | 'f' | 'i' | 'b';
    abstract class AbstractRegister {
        
    }
    export class HardwareRegister extends AbstractRegister {

    }
    export class VirtualRegister extends AbstractRegister {
        
    }
    export class CompileContext {

    }
    export namespace ASMUtil {
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

    }
}