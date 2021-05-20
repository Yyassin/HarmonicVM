import { createMemory } from './src/assets/createMemory';
import  CPU  from './src/assets/CPU';
import { branchSubroutine } from './src/assets/programs';
import * as readline from 'readline';

// 2^16 8-bit words
const memory = createMemory(65536);
const writableBytes = new Uint8Array(memory.buffer); // Each cell is a byte

// Create cpu.
const cpu = new CPU(memory);

/* Create instruction set */

// Load program to count to three in Mmem.
// TODO: Instead of cycles, add a breakpoint instruction.
const cycles = branchSubroutine(writableBytes);

// Run the program.
cpu.viewMemoryAt(cpu.getRegister('pc'), 8); // next instruction(s)
cpu.viewMemoryAt(0xffff - 43, 44);

/* Setup node readline to step through and see each instruction cycle */

// Set readline to recognize cmd input and provide output.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Create a 'newline' event. On event, step.
rl.on('line', () => {
    cpu.cycle();
    cpu.debug();
    cpu.viewMemoryAt(cpu.getRegister('pc'), 8); // next instruction(s)
    cpu.viewMemoryAt(0xffff - 43, 44);
})
