import { createMemory } from './createMemory';
import type { IMemory, Memory } from '../types';
import instructions from './instructions';

class CPU {
    #memory: IMemory;                    // Main memory [8-bit words]
    #registerLabels: Array<string>;     // Names for general purpose 16-bit registers (GPRs).
    #registers: Memory;                 // Memory for the GPRs.
    #registersMap: Object;              // Map: Register Label -> Memory Location 
    #stackFrameSize: number;            // Size of the current stack frame.
    /**
     * Create a new CPU with the specified main memory.
     * @param memory Memory, this CPU's main memory module.
     */
    constructor(memory: IMemory) {
        this.#memory = memory;

        /** Register labels
         *  'pc' -> program counter
         *  'fp' -> frame pointer
         *  'sp' -> stack pointer
         *  'acc' -> arithmetic accumulator
         *  'rx' -> general register
         **/
        this.#registerLabels = [
            'r0', 'r1', 'r2', 'r3',
            'r4', 'r5', 'r6', 'r7',
            'acc', 'sp', 'fp', 'pc'
        ];

        // 16-bits or 2 bytes for each register
        this.#registers = createMemory(this.#registerLabels.length * 2);

        // Map register label to its start bit in register memory.
        this.#registersMap = this.#registerLabels.reduce((map, label, idx) => {
            map[label]  = idx * 2;
            return map;
        }, {});

        this.#stackFrameSize = 0;

        /* Set stack and frame pointer to end of mmem. */

        // -2 since 0-index and 16-bit instructions: 2 bytes
        // notice that the implementation decrements *after* insertion.
        this.setRegister('sp', 0xffff - 1);  // Storing 2 bytes, start at block [0xfffe, 0xffff]
        this.setRegister('fp', 0xffff - 1);
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
     * in addition to the n bytes that follow.
     * 0x0f01: 0x04 0xab 0x7f ... 0x08 [8 words here]
     * @param address number, the address to inspect.
     * @param n number, the number of bytes around address.
     */
    viewMemoryAt(address: number, n: number): void {
        // Arraylike: [undefined x n].
        // Get and format next n words starting with memory[address].
        const nextNBytes = Array.from({length: n}, (_, i) =>
            this.#memory.getUint8(address + i)
        ).map(byte => `0x${byte.toString(16).padStart(2, '0')}`);

        // Print the memory address followed by contents in 8 words.
        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextNBytes.join(' ')}`);
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
     * Get the register index from hex encoding in memory.
     * Given 0x01 -> R1 -> index 2 (2nd set of bytes following R0).
     * @returns number, the register index.
     */
    fetchRegIndex(): number { return (this.fetch() % this.#registerLabels.length) * 2; }

    /**
     * Push specified value to top of stack, then grow stack pointer (down).
     * @param value number, the value to push to stack.
     */
    push(value: number): void {
        const spAddress = this.getRegister('sp');
        this.#memory.setUint16(spAddress, value);
        this.setRegister('sp', spAddress - 2); // Stack grows down 2 bytes 16b.
        this.#stackFrameSize += 2;
    }

    /**
     * Pop top stack contents.
     * @returns number, the popped contents.
     */
    pop(): number {
        const spAddressPopped = this.getRegister('sp') + 2;
        this.setRegister('sp', spAddressPopped);
        this.#stackFrameSize -= 2;
        return this.#memory.getUint16(spAddressPopped);
    }

    /**
     * Push the current cpu state to the stack.
     */
    pushState(): void {
        // Push contents of GPRs and PC to stack
        this.#registerLabels.forEach((label: string) => {
            if (['acc', 'sp', 'fp'].includes(label)) return;
            this.push(this.getRegister(label));                    
        })

        this.push(this.#stackFrameSize + 2);    // Account for this push.
        // Frame pointer updated to new stack frame.
        this.setRegister('fp', this.getRegister('sp'));
        this.#stackFrameSize = 0;
    }

    popState(): void {
        const framePointerAddress = this.getRegister('fp');
        // Right above stack frame size.
        this.setRegister('sp', framePointerAddress);
        this.#stackFrameSize = this.pop();
        const stackFrameSize = this.#stackFrameSize;

        // Pop PC then GPRs back.
        this.#registerLabels.slice().reverse().forEach((label: string) => {
            if (['acc', 'sp', 'fp'].includes(label)) return;
            
            this.setRegister(label, this.pop());                    
        })

        // Subroutine called with args, numberArgs.
        const numberArgs = this.pop();
        this.setRegister('sp', this.getRegister('sp') + numberArgs * 2);

        // Reset to the previous frame.
        this.setRegister('fp', framePointerAddress + stackFrameSize);
    }

    /**
     * Decode and execute the specified 8-bit instruction.
     * @param instruction number, the 8-bit instruction to execute.
     */
    execute(instruction: number): boolean | void {
        switch(instruction) {
            // Move 16b literal into destination register.
            case instructions.MOV_LIT_RD: {
                // Get the index and account for byte offset: each Reg is 2 bytes.
                const registerIdx = this.fetchRegIndex();
                
                const literal = this.fetch16();
                return this.#registers.setUint16(registerIdx, literal);
            }

            // Move source register contents to destination register.
            case instructions.MOV_RS_RD: {
                // Get register indices
                const registerSrc = this.fetchRegIndex();
                const registerDest = this.fetchRegIndex();
                const srcVal = this.#registers.getUint16(registerSrc);
                return this.#registers.setUint16(registerDest, srcVal);
            }

            // Store contents of source register into main memory[imm16].
            case instructions.STR_RS_MEM: {
                // Get register index
                const registerSrc = this.fetchRegIndex();
                const memAddress = this.fetch16();
                const value = this.#registers.getUint16(registerSrc);
                return this.#memory.setUint16(memAddress, value);
            }

            case instructions.STR_LIT_MEM: {
                const value  = this.fetch16();
                const memAddress = this.fetch16();
                return this.#memory.setUint16(memAddress, value);
            }

            // Load contents of main memory[imm16] in destination register.
            case instructions.LDR_MEM_RD: {
                // Get register index
                const registerSrc = this.fetchRegIndex();
                const memAddress = this.fetch16();
                const value = this.#memory.getUint16(memAddress);
                return this.#registers.setUint16(registerSrc, value);
            }

            // [R2] <- Mmem[R1]
            case instructions.LDR_REG_IND_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const ptr = this.#registers.getUint16(r1);
                const value = this.#memory.getUint16(ptr);
                this.#registers.setUint16(r2, value);
            }

            // [RD] <- Mmem[RS + offset] *Unsigned offset
            case instructions.LDR_LIT_OFF_REG: {
                const baseAddress = this.fetch16(); // Offset
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const offset = this.#registers.getUint16(r1);
                const value = this.#memory.getUint16(baseAddress * offset);
                return this.#registers.setUint16(r2, value);
            }

            // Add register x to register y.
            case instructions.ADD_RX_RY: {
                // 8bit : [0 -> 7], No Instruction Register here
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX + registerValueY);
            }

            case instructions.ADD_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue + literal);
            }

            //* unsigned
            case instructions.SUB_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue - literal);
            }

            case instructions.SUB_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value - register2Value);
            }

            case instructions.SUB_RX_RY: {
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX - registerValueY);
            }

            case instructions.MUL_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue * literal);
            }

            // * unsigned
            case instructions.MUL_REG_REG: {
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX * registerValueY);
            }

            case instructions.INC_REG: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue + 1);
            }

            case instructions.DEC_REG: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue - 1);
            }

            // in place
            case instructions.LSL_REG_LIT: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue << literal);
            }

            case instructions.LSL_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.#registers.setUint16(r1, register1Value << register2Value);
            }

            case instructions.LSR_REG_LIT: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue >> literal);
            }

            case instructions.LSR_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.#registers.setUint16(r1, register1Value >> register2Value);
            }

            case instructions.AND_REG_LIT: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue & literal);
            }

            case instructions.AND_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value & register2Value);
            }

            case instructions.OR_REG_LIT: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue | literal);
            }

            case instructions.OR_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value | register2Value);
            }

            case instructions.XOR_REG_LIT: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue ^ literal);
            }

            case instructions.XOR_REG_REG: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value ^ register2Value);
            }

            case instructions.NOT: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);

                // JS internally converts the value to 32 bits, with 1s
                // in MSB 16 bits -> mask to get the LSB 16 which we want;
                const invertedValue = (~registerValue) & 0xffff
                return this.setRegister('acc', invertedValue);
            }

            // Branch to specified address iff literal != [acc]
            case instructions.JMP_NOT_EQ: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal !== this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JNE_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value !== this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JEQ_LIT: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal === this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JEQ_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value === this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JLT_LIT: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal < this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JLT_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value < this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JGT_LIT: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal > this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JGT_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value > this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JLE_LIT: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal <= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JLE_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value <= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JGE_LIT: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal >= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructions.JGE_REG: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value >= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            // Push a literal to top of stack.
            case instructions.PSH_LIT: {
                const value = this.fetch16();
                return this.push(value);
            }

            // Push the contents of source register to top of stack.
            case instructions.PSH_RS: {
                const registerSrc = this.fetchRegIndex();
                const value = this.#registers.getUint16(registerSrc);
                return this.push(value);
            }
            
            // Pop contents at top of stack in destination register.
            case instructions.POP: {
                const registerDest = this.fetchRegIndex();
                return this.#registers.setUint16(registerDest, this.pop());
            }

            // Branch to subroutine at literal address
            case instructions.CAL_LIT: {
                const branchAddress = this.fetch16();
                this.pushState();
                // Branch to subroutine
                return this.setRegister('pc', branchAddress);
            }

             // Branch to subroutine at address in register
             case instructions.CAL_LIT: {
                const registerIdx = this.fetchRegIndex();
                const branchAddress = this.#registers.getUint16(registerIdx);
                this.pushState();
                // Branch to subroutine
                return this.setRegister('pc', branchAddress);
            }

            // Return from subroutine
            case instructions.RET: {
                return this.popState();
           }

           case instructions.HLT: {
               return true;
           }
        }
    }

    /**
     * Perform a fetch, decode, execute CPU cycle [usually 4 words - opCode, rx, ry, mem]
     */
    cycle(): boolean | void { return this.execute(this.fetch()); }

    run() {
        const halt = this.cycle();

        if(!halt) {
            setImmediate(() => this.run());
        }
    }
}

export default CPU;