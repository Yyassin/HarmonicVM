import instructions from './instructions';

// General purpose register encodings (byte offset indices).
const reg = {
    R0: 0,
    R1: 1,
    R2: 2,
    R3: 3,
    R4: 4,
    R5: 5,
    R6: 6,
    R7: 7,
    ACC: 8,
    SP: 9,
    FP: 10,
    PC: 11
}

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
    writableBytes[i++] = reg.R1;

    // mov 0xABCD r2 : 0x10ABCD02
    // R2 <- 0-extend(0xABCD)
    // pc 3 -> 4 -> 6 -> 7
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = 0xAB; //0xABCD
    writableBytes[i++] = 0xCD;
    writableBytes[i++] = reg.R2;

    // *add r1 r2 [stored in accumulator: implicit] : 0x140102__.
    // ACC <- [R1] + [R2]
    // pc 6 -> 7 -> 8
    writableBytes[i++] = instructions.ADD_RX_RY;
    writableBytes[i++] = 0x1; // r1 idx
    writableBytes[i++] = 0x2; //r2 idx

    // str acc 0x0100 : 0x12080100 **NOT Reg or PC-relative
    // Mmem[0-extend(0x0100)] <- [ACC]
    writableBytes[i++] = instructions.STR_RS_MEM;
    writableBytes[i++] = reg.ACC;
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
    writableBytes[i++] = reg.R2;
    writableBytes[i++] = 0x00; // 0x0001
    writableBytes[i++] = 0x01;

    // ldr r1, #0x0100;
    writableBytes[i++] = instructions.LDR_MEM_RD;
    writableBytes[i++] = reg.R1;
    writableBytes[i++] = 0x01; // 0x0100
    writableBytes[i++] = 0x00;

    // add r1, r2;
    writableBytes[i++] = instructions.ADD_RX_RY;
    writableBytes[i++] = reg.R1;
    writableBytes[i++] = reg.R2;
    
    // str acc, #0x0100
    writableBytes[i++] = instructions.STR_RS_MEM;
    writableBytes[i++] = reg.ACC;
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

/**
 * Program that swaps the contents in R1 and R2 using
 * stack mechanics: push r1 r2 then pop r1 r2.
 * start:
 *      mov r1, #0x5151;
 *      mov r2, #0x4242;
 *      psh r1;
 *      psh r2;
 *      pop r1;
 *      pop r2;
 * done:
 * @param writableBytes Uint8Array, the computer's main memory.
 */
export const stackSwap = (writableBytes: Uint8Array): void => {
    // mov r1, #0x5151;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R1;
    writableBytes[i++] = 0x51; // 0x5151
    writableBytes[i++] = 0x51;

    // mov r2, #0x4242;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R2;
    writableBytes[i++] = 0x42; // 0x4242
    writableBytes[i++] = 0x42;

    // psh r1;
    writableBytes[i++] = instructions.PSH_RS;
    writableBytes[i++] = reg.R1;

    // psh r2;
    writableBytes[i++] = instructions.PSH_RS;
    writableBytes[i++] = reg.R2;

    // pop r2;
    writableBytes[i++] = instructions.POP;
    writableBytes[i++] = reg.R1;

    // psh r1;
    writableBytes[i++] = instructions.POP;
    writableBytes[i++] = reg.R2;
}

/**
 * Program to test subroutine branching and restoration
 * of stack frames.
 * @param writableBytes Uint8Array, the computer's main memory
 */
export const branchSubroutine = (writableBytes: Uint8Array): void => {
    const subroutineAddress = 0x3000;
    /* Push values on stack that should remain after return. */
    // psh 0x3333;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x33; //0x3333
    writableBytes[i++] = 0x33;

    // psh 0x2222;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x22; //0x2222
    writableBytes[i++] = 0x22;
    
    // psh 0x1111;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x11; //0x1111
    writableBytes[i++] = 0x11;

    /* Store values in registers to test restored. */
    // mov r1, #0x1234;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R1;
    writableBytes[i++] = 0x12; // 0x5151
    writableBytes[i++] = 0x34;

    // mov r1, #0x1234;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R4;
    writableBytes[i++] = 0x56; // 0x5151
    writableBytes[i++] = 0x78;

    /* Calling subroutine@0x3000 with 0 args. */
    // psh 0x0000;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x00; //0x0000
    writableBytes[i++] = 0x00;

    // cal subroutine
    writableBytes[i++] = instructions.CAL_LIT;
    writableBytes[i++] = (subroutineAddress & 0xff00) >> 8; //0x30
    writableBytes[i++] = (subroutineAddress & 0x00ff);      //0x00

    // psh 0x4444; Should also be preserved
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x44; //0x4444
    writableBytes[i++] = 0x44;

    // Subroutine; @0x3000
    i = subroutineAddress

    /* Test new stack frame */
    // psh 0x0102;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x01; //0x0102
    writableBytes[i++] = 0x02;

    // psh 0x0304;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x03; //0x0304
    writableBytes[i++] = 0x04;
    
    // psh 0x0506;
    writableBytes[i++] = instructions.PSH_LIT;
    writableBytes[i++] = 0x05; //0x0506
    writableBytes[i++] = 0x06;

    /* Register values should revert. */
    // mov r1, #0x0708;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R1;
    writableBytes[i++] = 0x07; // 0x4242
    writableBytes[i++] = 0x08;

    // mov r7, #0x090A;
    writableBytes[i++] = instructions.MOV_LIT_RD;
    writableBytes[i++] = reg.R7;
    writableBytes[i++] = 0x09; // 0x090A
    writableBytes[i++] = 0x0A;

    writableBytes[i++] = instructions.RET;
}
