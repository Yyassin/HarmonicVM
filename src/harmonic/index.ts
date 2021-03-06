import { createMemory } from './src/cpu/createMemory';
import  CPU  from './src/cpu/CPU';
import { Memory } from "./src/types";
/* IO / display code - not used right now */
// import MemoryMapper from './src/cpu/MemoryMapper';
// import * as readline from 'readline';
// import { createScreenDevice } from './src/cpu/screenDevice';
// import { screenDeviceProgram } from './src/cpu/programs';

// VM Initialization and Program Loading 
export interface VM { memory: Memory, writableBytes: Uint8Array, cpu: CPU };
export const init = (program: Uint8Array = null, base: number, previousMemory: Uint8Array): VM => {
    const memory = createMemory(256 * 256);                 // Create memory - 16-bit VM : 65536 words
    const writableBytes = new Uint8Array(memory.buffer);
    if (previousMemory) writableBytes.set(previousMemory);
    const cpu = new CPU(memory);

    // Store the program machine code in memory
    // -> We have to do it this way since React's
    // state is immutable.
    for (let i = 0; program && i < program.length; i++) {
        writableBytes[base + i] = program[i];
    }

    return { memory, writableBytes, cpu };
}


/* Old test code

// 2^16 8-bit words
const memory = createMemory(65536);
const writableBytes = new Uint8Array(memory.buffer); // Each cell is a byte

//Create cpu.
const memoryMapper = new MemoryMapper();
const cpu = new CPU(memoryMapper);

// Map the entire address space
memoryMapper.map(memory, 0x0000, 0xffff);

// Map 256 B of address space to screen device;
// Remaps to 0 to ff
memoryMapper.map(createScreenDevice(), 0x3000, 0x30ff, true);

// Create instruction set 

// Load program to count to three in Mmem.
screenDeviceProgram(writableBytes);

cpu.run();

Run the program.
cpu.viewMemoryAt(cpu.getRegister('pc'), 8); // next instruction(s)
cpu.viewMemoryAt(0xffff - 43, 44);

// Setup node readline to step through and see each instruction cycle

Set readline to recognize cmd input and provide output.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Create a 'newline' event. On event, step.
rl.on('line', () => {
    cpu.cycle();
    //cpu.debug();
    //cpu.viewMemoryAt(cpu.getRegister('pc'), 8); // next instruction(s)
    //cpu.viewMemoryAt(0xffff - 43, 44);
});

*/

