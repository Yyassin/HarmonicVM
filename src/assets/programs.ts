import instructions from './instructions';

// General purpose register encodings (byte offset indices).
const PC = 9;
const ACC = 8;
const R1 = 1;
const R2 = 2;

let i = 0;  // Counter to make writing easier for now.

/**
 * Program that adds 0x1234 + 0abcd and stores 
 * the result in Mmem[0x0100];
 * start:
 *      mov r1, #0x1234     ;
 *      mov r2, #0xabcd     ;
 *      add r1, r2          ;implicitly stores in acc
 *      str acc, #0x0100    ;
 * done:                    
 * @param writableBytes Uint8Array, the computer's main memory.
 */
export const storeMmem = (writableBytes: Uint8Array): void => {

    // mov 0x1234 r1 : 0x10123401
    // R1 <- 0-extend(0x1234)
    // pc 0 -> 1 -> 3 -> 4
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = 0x12; //0x1234
    writableBytes[i++] = 0x34;
    writableBytes[i++] = R1;

    // mov 0xABCD r2 : 0x10ABCD02
    // R2 <- 0-extend(0xABCD)
    // pc 3 -> 4 -> 6 -> 7
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = 0xAB; //0xABCD
    writableBytes[i++] = 0xCD;
    writableBytes[i++] = R2;

    // *add r1 r2 [stored in accumulator: implicit] : 0x140102__.
    // ACC <- [R1] + [R2]
    // pc 6 -> 7 -> 8
    writableBytes[i++] = instructions.ADD_RX_RY;
    writableBytes[i++] = 0x1; // r1 idx
    writableBytes[i++] = 0x2; //r2 idx

    // str acc 0x0100 : 0x12080100 **NOT Reg or PC-relative
    // Mmem[0-extend(0x0100)] <- [ACC]
    writableBytes[i++] = instructions.STR_RS_MEM;
    writableBytes[i++] = ACC;
    writableBytes[i++] = 0x01; // 0x0100
    writableBytes[i++] = 0x00;
}

/**
 * Program that counts to three, storing the accumulated
 * result at Mmem[0x0100];
 * mov r2, 0x0001            ;increment (no imm16 yet)
 * start:
 *      ldr r1, #0x0100     ;Mmem[0x0100] initially 0
 *      add r1, r2          ;implicitly stores in acc
 *      str acc, #0x0100    ;
 *      jne #0x0003, start  ;
 * done:                    
 * @param writableBytes Uint8Array, the computer's main memory.
 */
export const countToThree = (writableBytes: Uint8Array): void => {
    // mov r2, 0x0001;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = R2;
    writableBytes[i++] = 0x00; // 0x0001
    writableBytes[i++] = 0x01;

    // ldr r1, #0x0100;
    writableBytes[i++] = instructions.LDR_MEM_RD;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x01; // 0x0100
    writableBytes[i++] = 0x00;

    // add r1, r2;
    writableBytes[i++] = instructions.ADD_RX_RY;
    writableBytes[i++] = R1;
    writableBytes[i++] = R2;
    
    // str acc, #0x0100
    writableBytes[i++] = instructions.STR_RS_MEM;
    writableBytes[i++] = ACC;
    writableBytes[i++] = 0x01; // 0x0001
    writableBytes[i++] = 0x00;

    // jne 0x0003, start; ~ CMP ACC, 0x0003;
    //                      BNE start;
    // assume label 'start' has address 0x0001 (it does for this unit alone).
    writableBytes[i++] = instructions.JMP_NOT_EQ;
    writableBytes[i++] = 0x00;  // 0x0003
    writableBytes[i++] = 0x03; 
    writableBytes[i++] = 0x00;  // 0x0000: start address
    writableBytes[i++] = 0x01;  
}