import { createMemory } from './createMemory';
import type { Memory } from '../types';
import instructions from './instructions';

class CPU {
    #memory: Memory;                    // Main memory [8-bit words]
    #registerLabels: Array<string>;     // Names for general purpose 16-bit registers (GPRs).
    #registers: Memory;                    // Memory for the GPRs.
    #registersMap: Object;                 // Map: Register Label -> Memory Location 
    
    /**
     * Create a new CPU with the specified main memory.
     * @param memory Memory, this CPU's main memory module.
     */
    constructor(memory: Memory) {
        this.#memory = memory;

        /** Register labels
         *  'pc' -> program counter
         *  'acc' -> arithmetic accumulator
         *  'rx' -> general register
         **/
        this.#registerLabels = [
            'r0', 'r1', 'r2', 'r3',
            'r4', 'r5', 'r6', 'r7',
            'acc', 'pc',
        ];

        // 16-bits or 2 bytes for each register
        this.#registers = createMemory(this.#registerLabels.length * 2);

        // Map register label to its start bit in register memory.
        this.#registersMap = this.#registerLabels.reduce((map, label, idx) => {
            map[label]  = idx * 2;
            return map;
        }, {});
    }

    /**
     * Prints the name and contents of each register.
     */
    debug() {
        this.#registerLabels.forEach((label: string): void => {
            console.log(`${label}: \t0x${this.getRegister(label).toString(16).padStart(4, '0')}`);
        });
        console.log('\n----------\n')
    }

   /**
    * Get an unsigned representation for the 16 bits in register 'label'.
    * @param label string, the label of the register.
    * @returns number, the representation of the 16 bits in the register. 
    */
    getRegister(label: string): number {
        if (!(label in this.#registersMap)) 
            throw new Error (`getRegister(label): No such register '${label}'`);
        return this.#registers.getUint16(this.#registersMap[label]);
    }

    /**
     * Set the 16 bits in register 'label' with unsigned rep. of specified value.
     * @param label string, the label of the register.
     * @param value number, the unsigned 16 bit number to set.
     */
    setRegister(label: string, value: number): void {
        if (!(label in this.#registersMap)) 
            throw new Error (`setRegister(label): No such register '${label}'`);
        return this.#registers.setUint16(this.#registersMap[label], value);
    }

    /**
     * CPU fetch cycle.
     * Fetch next instruction from main memory and increment PC.
     * @returns number, the 8-bit instruction.
     */
    fetch(): number {
        const nextInstructionAddress = this.getRegister('pc');
        const instruction = this.#memory.getUint8(nextInstructionAddress);
        this.setRegister('pc', nextInstructionAddress + 1);                 // Incr 1 byte.
        return instruction;
    };

    /**
     * Get the contents of the next two 8-bit words (for 16-bit literals).
     * This is not realistic.
     * @returns number, the 16-bits for next two words
     */
    fetch16(): number {
        const nextLiteralsAddress = this.getRegister('pc');
        const literals = this.#memory.getUint16(nextLiteralsAddress);
        this.setRegister('pc', nextLiteralsAddress + 2);                 // Incr 2 bytes.
        return literals;
    };

    /**
     * Decode and execute the specified 8-bit instruction.
     * @param instruction number, the 8-bit instruction to execute.
     */
    execute(instruction: number): void {
        switch(instruction) {
            // Move 16b literal into r1 register.
            case instructions.MOV_LIT_R1: {
                const literal = this.fetch16();
                this.setRegister('r1', literal);
                return;
            }

            // Move 16b literal into r2 register.
            case instructions.MOV_LIT_R2: {
                const literal = this.fetch16();
                this.setRegister('r2', literal);
                return;
            }

            // Add register x to register y.
            case instructions.ADD_RX_RY: {
                // 8bit : [0 -> 7], No Instruction Register here
                const rx = this.fetch();
                const ry = this.fetch();
                const registerValueX = this.#registers.getUint16(rx * 2);
                const registerValueY = this.#registers.getUint16(ry * 2);
                this.setRegister('acc', registerValueX + registerValueY);
                return;
            }
        }
    }

    /**
     * Perform a fetch, decode, execute CPU cycle.
     */
    cycle(): void { return this.execute(this.fetch()); }
}

export default CPU;