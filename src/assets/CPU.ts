import { createMemory } from './createMemory';
import type { Memory } from '../types';
import instructions from './instructions';

class CPU {
    #memory: Memory;                    // Main memory [8-bit words]
    #registerLabels: Array<string>;     // Names for general purpose 16-bit registers (GPRs).
    #registers: Memory;                 // Memory for the GPRs.
    #registersMap: Object;              // Map: Register Label -> Memory Location 
    
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
    debug(): void {
        this.#registerLabels.forEach((label: string): void => {
            console.log(`${label}: \t0x${this.getRegister(label).toString(16).padStart(4, '0')}`);
        });
        console.log('\n----------\n')
    }

    /**
     * View the byte at the specified address in main memory
     * in addition to the 7 bytes that follow.
     * 0x0f01: 0x04 0xab 0x7f ... 0x08 [8 words here]
     * @param address number, the address to inspect.
     */
    viewMemoryAt(address: number): void {
        // Arraylike: [undefined x 8].
        // Get and format next 8 words starting with memory[address].
        const nextEightBytes = Array.from({length: 8}, (_, i) =>
            this.#memory.getUint8(address + i)
        ).map(byte => `0x${byte.toString(16).padStart(2, '0')}`);

        // Print the memory address followed by contents in 8 words.
        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`);
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
            // Move 16b literal into destination register.
            case instructions.MOV_LIT_RD: {
                // Get the index and account for byte offset: each Reg is 2 bytes.
                const registerIdx = (this.fetch() % this.#registerLabels.length) * 2; 
                
                const literal = this.fetch16();
                this.#registers.setUint16(registerIdx, literal);
                return;
            }

            // Move source register contents to destination register.
            case instructions.MOV_RS_RD: {
                // Get register indices
                const registerSrc = (this.fetch() % this.#registerLabels.length) * 2; 
                const registerDest = (this.fetch() % this.#registerLabels.length) * 2; 
                const srcVal = this.#registers.getUint16(registerSrc);
                this.#registers.setUint16(registerDest, srcVal);
                return;
            }

            // Store contents of source register into main memory[imm16].
            case instructions.STR_RS_MEM: {
                // Get register index
                const registerSrc = (this.fetch() % this.#registerLabels.length) * 2; 
                const memAddress = this.fetch16();
                const value = this.#registers.getUint16(registerSrc);
                this.#memory.setUint16(memAddress, value);
                return;
            }

            // Load contents of main memory[imm16] in destination register.
            case instructions.LDR_MEM_RD: {
                // Get register index
                const registerSrc = (this.fetch() % this.#registerLabels.length) * 2; 
                const memAddress = this.fetch16();
                const value = this.#memory.getUint16(memAddress);
                this.#registers.setUint16(registerSrc, value);
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

            // Branch to specified address iff literal != [acc]
            case instructions.JMP_NOT_EQ: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal != this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }
        }
    }

    /**
     * Perform a fetch, decode, execute CPU cycle [usually 4 words - opCode, rx, ry, mem]
     */
    cycle(): void { return this.execute(this.fetch()); }
}

export default CPU;