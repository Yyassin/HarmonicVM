/**
 * EXPERIMENTAL - Not in use
 * 
 * A memory banking system to 
 * support interfacing with multiple memory units.
 */

import { IMemory } from "../types";
import CPU from "./CPU";
import { createMemory } from "./createMemory";
import MemoryMapper from "./MemoryMapper";

const memoryFunctions: readonly (keyof IMemory)[] = [
    'getUint16', 'getUint8', 'setUint16', 'setUint8'
] as const;

type BankForwardInterface = (name: keyof IMemory) => (...args: any) => number | void;
type BankInterface = Record<keyof IMemory, ReturnType<BankForwardInterface>>;
/**
 * Creates n memory banks corresponding to the specified cpu.
 * @param n number, the number of banks that are accessible.
 * @param bankSize number, the number of bytes per bank.
 * @param CPU CPU, reference to the cpu to bank memory for.
 */
const createBankedMemory = (n: number, bankSize: number, cpu: CPU) => {
    // Create n memory banks of size bankSize.
    const bankBuffers = Array.from({ length: n }, () => new ArrayBuffer(bankSize));
    const banks = bankBuffers.map(bank => new DataView(bank));

    const forwardToBank: BankForwardInterface = (name: keyof IMemory) => (...args: any) => {
        const bankIndex = cpu.getRegister('mb') % n; // Ensure index range
        const indexedBank = banks[bankIndex];
        //@ts-ignore Let's assume this is used properly :)
        return indexedBank[name](...args);
    }

    // Map memory interface to be compatible with the bank model
    const bankInterface: BankInterface = memoryFunctions.reduce((publicInterface: BankInterface, functionName: keyof IMemory) => {
        publicInterface[functionName] = forwardToBank(functionName);
        return publicInterface;
    }, {} as BankInterface);

    return bankInterface;
}

const bankSize = 0xff;
const nBanks = 8;
const mm = new MemoryMapper();
const cpu = new CPU(mm);

const memoryBankDevice = createBankedMemory(nBanks, bankSize, cpu);
mm.map(memoryBankDevice as any, 0, bankSize);

const regularMemory = createMemory(0xff00);
mm.map(regularMemory, bankSize, 0xffff, true);

console.log(`write 1 to address 0`);
mm.setUint16(0, 1);
console.log(`reading value at address 0:`, mm.getUint16(0));

console.log(`\n::: switching memory bank (0 -> 1)`);
cpu.setRegister('mb', 1);
console.log(`reading value at address 0:`, mm.getUint16(0));

console.log(`write 42 to address 1`);
mm.setUint16(0, 42);

console.log(`\n::: switching memory bank (1 -> 2)`);
cpu.setRegister('mb', 2);
console.log(`reading value at address 0:`, mm.getUint16(0));

console.log(`\n::: switching memory bank (2 -> 1)`);
cpu.setRegister('mb', 1);
console.log(`reading value at address 0:`, mm.getUint16(0))

console.log(`\n::: switching memory bank (1 -> 0)`);
cpu.setRegister('mb', 0);
console.log(`reading value at address 0:`, mm.getUint16(0))