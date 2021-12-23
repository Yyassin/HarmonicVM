import { createMemory } from './createMemory';
import type { IMemory, Memory } from '../types';
import instructions from './instructions';
import instructionsMeta from './instructions';
import registers from './registers';

type RegisterBank = any;

class CPU {
    #memory: IMemory;                    // Main memory [8-bit words]
    readonly #registerLabels: string[];     // Names for general purpose 16-bit registers (GPRs).
    #registers: Memory;                 // Memory for the GPRs.
    #registersMap: Object;              // Map: Register Label -> Memory Location 
    #stackFrameSize: number;            // Size of the current stack frame.
    #interruptVectorAddress: number;
    #isInInterruptHandler: boolean;

    /**
     * Create a new CPU with the specified main memory.
     * @param memory Memory, this CPU's main memory module.
     */
    constructor(memory: IMemory, interruptVectorAddress = 0x1000) {
        this.#memory = memory;

        /** Register labels
         *  'pc' -> program counter
         *  'fp' -> frame pointer
         *  'sp' -> stack pointer
         *  'acc' -> arithmetic accumulator
         *  'rx' -> general register
         **/
        this.#registerLabels = [...registers];

        // 16-bits or 2 bytes for each register
        this.#registers = createMemory(this.#registerLabels.length * 2);

        // Map register label to its start bit in register memory.
        this.#registersMap = this.#registerLabels.reduce((map, label, idx) => {
            map[label]  = idx * 2;
            return map;
        }, {});

        this.#stackFrameSize = 0;

        // Up to 16 interrupt handlers
        this.#interruptVectorAddress = interruptVectorAddress;
        this.#isInInterruptHandler = false;
        // Enable all interrupts
        this.setRegister('im', 0xffff);

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
     * Prints the name and contents of each register.
     */
     getRegisterBank(): RegisterBank {
        return this.#registerLabels.reduce((bank: RegisterBank, label: string, idx): void => {
            bank[label] = `0x${this.getRegister(label).toString(16).padStart(4, '0')}`;
            return bank;
        }, {});
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

    handleInterrupt(id: number) {
        const interruptVectorIndex = id % 0xf;

        // Check if interrupt is enabled.
        const isUnmasked = Boolean((1 << interruptVectorIndex) & this.getRegister('im'));
        if (!isUnmasked) { return; }

        // Account for indexing by byte (counter is a nibble)
        const handlerAddressPointer = this.#interruptVectorAddress + (interruptVectorIndex * 2);
        const handlerAddress = this.#memory.getUint16(handlerAddressPointer);

        // Don't push state if nested interrupts
        if (!this.#isInInterruptHandler) {
            this.push(0); // No arguments are passed to handlers
            this.pushState();
        }

        this.#isInInterruptHandler = true;
        this.setRegister('pc', handlerAddress);
    }

    /**
     * Decode and execute the specified 8-bit instruction.
     * @param instruction number, the 8-bit instruction to execute.
     */
    execute(instruction: number): boolean | void {
        switch(instruction) {
            // Move 16b literal into destination register.
            case instructionsMeta.MOV_LIT_RD.opCode: {
                // Get the index and account for byte offset: each Reg is 2 bytes.
                const literal = this.fetch16();
                const registerIdx = this.fetchRegIndex();
                return this.#registers.setUint16(registerIdx, literal);
            }

            // Move source register contents to destination register.
            case instructionsMeta.MOV_RS_RD.opCode: {
                // Get register indices
                const registerSrc = this.fetchRegIndex();
                const registerDest = this.fetchRegIndex();
                const srcVal = this.#registers.getUint16(registerSrc);
                return this.#registers.setUint16(registerDest, srcVal);
            }

            // Store contents of source register into main memory[imm16].
            case instructionsMeta.STR_RS_MEM.opCode: {
                // Get register index
                const registerSrc = this.fetchRegIndex();
                const memAddress = this.fetch16();
                const value = this.#registers.getUint16(registerSrc);
                return this.#memory.setUint16(memAddress, value);
            }

            case instructionsMeta.STR_LIT_MEM.opCode: {
                const value  = this.fetch16();
                const memAddress = this.fetch16();
                return this.#memory.setUint16(memAddress, value);
            }

            // Load contents of main memory[imm16] in destination register.
            case instructionsMeta.LDR_MEM_RD.opCode: {
                // Get register index
                const memAddress = this.fetch16();
                const registerSrc = this.fetchRegIndex();
                const value = this.#memory.getUint16(memAddress);
                return this.#registers.setUint16(registerSrc, value);
            }

            // [R2] <- Mmem[R1]
            case instructionsMeta.LDR_REG_IND_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const ptr = this.#registers.getUint16(r1);
                const value = this.#memory.getUint16(ptr);
                this.#registers.setUint16(r2, value);
            }

            // [RD] <- Mmem[RS + offset] *Unsigned offset
            case instructionsMeta.LDR_LIT_OFF_REG.opCode: {
                const baseAddress = this.fetch16(); // Offset
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const offset = this.#registers.getUint16(r1);
                const value = this.#memory.getUint16(baseAddress * offset);
                return this.#registers.setUint16(r2, value);
            }

            // Add register x to register y.
            case instructionsMeta.ADD_RX_RY.opCode: {
                // 8bit : [0 -> 7], No Instruction Register here
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX + registerValueY);
            }

            case instructionsMeta.ADD_LIT_REG.opCode: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue + literal);
            }

            //* unsigned
            case instructionsMeta.SUB_LIT_REG.opCode: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue - literal);
            }

            case instructionsMeta.SUB_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const lit = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', lit - registerValue);
            }

            case instructionsMeta.SUB_RX_RY.opCode: {
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX - registerValueY);
            }

            case instructionsMeta.MUL_LIT_REG.opCode: {
                const literal = this.fetch16();
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue * literal);
            }

            // * unsigned
            case instructionsMeta.MUL_REG_REG.opCode: {
                const rx = this.fetchRegIndex();
                const ry = this.fetchRegIndex();
                const registerValueX = this.#registers.getUint16(rx);
                const registerValueY = this.#registers.getUint16(ry);
                return this.setRegister('acc', registerValueX * registerValueY);
            }

            case instructionsMeta.INC_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue + 1);
            }

            case instructionsMeta.DEC_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue - 1);
            }

            // in place
            case instructionsMeta.LSL_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue << literal);
            }

            case instructionsMeta.LSL_REG_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.#registers.setUint16(r1, register1Value << register2Value);
            }

            case instructionsMeta.LSR_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.#registers.setUint16(r1, registerValue >> literal);
            }

            case instructionsMeta.LSR_REG_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.#registers.setUint16(r1, register1Value >> register2Value);
            }

            case instructionsMeta.AND_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue & literal);
            }

            case instructionsMeta.AND_REG_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value & register2Value);
            }

            case instructionsMeta.OR_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue | literal);
            }

            case instructionsMeta.OR_REG_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value | register2Value);
            }

            case instructionsMeta.XOR_REG_LIT.opCode: {
                const r1 = this.fetchRegIndex();
                const literal = this.fetch16();
                const registerValue = this.#registers.getUint16(r1);
                return this.setRegister('acc', registerValue ^ literal);
            }

            case instructionsMeta.XOR_REG_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const r2 = this.fetchRegIndex();
                const register1Value = this.#registers.getUint16(r1);
                const register2Value = this.#registers.getUint16(r2);
                return this.setRegister('acc', register1Value ^ register2Value);
            }

            case instructionsMeta.NOT.opCode: {
                const r1 = this.fetchRegIndex();
                const registerValue = this.#registers.getUint16(r1);

                // JS internally converts the value to 32 bits, with 1s
                // in MSB 16 bits -> mask to get the LSB 16 which we want;
                const invertedValue = (~registerValue) & 0xffff
                return this.setRegister('acc', invertedValue);
            }

            // Branch to specified address iff literal != [acc]
            case instructionsMeta.JMP_NOT_EQ.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal !== this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JNE_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value !== this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JEQ_LIT.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal === this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JEQ_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value === this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JLT_LIT.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal < this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JLT_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value < this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JGT_LIT.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal > this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JGT_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value > this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JLE_LIT.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal <= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JLE_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value <= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JGE_LIT.opCode: {
                const literal = this.fetch16();
                const branchAddress = this.fetch16();
                if (literal >= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            case instructionsMeta.JGE_REG.opCode: {
                const r1 = this.fetchRegIndex();
                const value = this.#registers.getUint16(r1);
                const branchAddress = this.fetch16();
                if (value >= this.getRegister('acc'))
                    this.setRegister('pc', branchAddress);
                return;
            }

            // Push a literal to top of stack.
            case instructionsMeta.PSH_LIT.opCode: {
                const value = this.fetch16();
                return this.push(value);
            }

            // Push the contents of source register to top of stack.
            case instructionsMeta.PSH_RS.opCode: {
                const registerSrc = this.fetchRegIndex();
                const value = this.#registers.getUint16(registerSrc);
                return this.push(value);
            }
            
            // Pop contents at top of stack in destination register.
            case instructionsMeta.POP.opCode: {
                const registerDest = this.fetchRegIndex();
                return this.#registers.setUint16(registerDest, this.pop());
            }

            // Branch to subroutine at literal address
            case instructionsMeta.CAL_LIT.opCode: {
                const branchAddress = this.fetch16();
                this.pushState();
                // Branch to subroutine
                return this.setRegister('pc', branchAddress);
            }

             // Branch to subroutine at address in register
             case instructionsMeta.CAL_LIT.opCode: {
                const registerIdx = this.fetchRegIndex();
                const branchAddress = this.#registers.getUint16(registerIdx);
                this.pushState();
                // Branch to subroutine
                return this.setRegister('pc', branchAddress);
            }

            // Return from subroutine
            case instructionsMeta.RET.opCode: {
                return this.popState();
           }

           case instructionsMeta.HLT.opCode: {
               return true;
           }

           case instructionsMeta.INT.opCode: {
               const interruptID = this.fetch16();
               return this.handleInterrupt(interruptID);
           }

           case instructionsMeta.RET_INT.opCode: {
               this.#isInInterruptHandler = false;
               this.popState();
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