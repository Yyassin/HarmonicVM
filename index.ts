import { createMemory } from './src/assets/createMemory';
import  CPU  from './src/assets/CPU';
import instructions from './src/assets/instructions';

// 256 8-bit words
const memory = createMemory(256);
const writableBytes = new Uint8Array(memory.buffer); // Each cell is a byte

const cpu = new CPU(memory);

/* Create instruction set */

// mov 0x1234 r1
// pc 0 -> 1 -> 3
writableBytes[0] = instructions.MOV_LIT_R1;
writableBytes[1] = 0x12; //0x1234
writableBytes[2] = 0x34;

// mov 0x1234 r1
// pc 3 -> 4 -> 6
writableBytes[3] = instructions.MOV_LIT_R2;
writableBytes[4] = 0xAB; //0x1234
writableBytes[5] = 0xCD;

// mov 0x1234 r1
// pc 6 -> 7 -> 8
writableBytes[6] = instructions.ADD_RX_RY;
writableBytes[7] = 0x1; // r1 idx
writableBytes[8] = 0x2; //r2 idx

for (let i: number = 0; i < 3; i++) {
    cpu.cycle();
    cpu.debug();
}
