import * as Arc from "../../../../node_modules/arcsecond/index";
import { InstructionMnemonic, instructionType } from "../../../assets/instructions";
import {
    regReg,
    litReg,
    regMem,
    memReg,
    litMem,
    regIndReg,
    litOffReg,
    noArgs,
    singleReg,
    singleLit,
    regLit
} from "./generic";

const { 
    MOV, 
    ADD,
    SUB, 
    MUL,
    AND,
    OR,
    XOR,
    LSL,
    LSR,
    INC,
    DEC,
    NOT,
    JEQ,
    JNE,
    JLT,
    JGT,
    JLE,
    JGE,
    PSH,
    POP,
    CAL,
    RET,
    HLT  
} = InstructionMnemonic;

const mov = Arc.choice([
    regReg(MOV, instructionType[MOV].regReg),
    litReg(MOV, instructionType[MOV].litReg),
    memReg(MOV, instructionType[MOV].memReg),
    regMem(MOV, instructionType[MOV].regMem),
    litMem(MOV, instructionType[MOV].litMem),
    regIndReg(MOV, instructionType[MOV].regIndReg),
    litOffReg(MOV, instructionType[MOV].litOffReg)
]);

const add = Arc.choice([
    regReg(ADD, instructionType[ADD].regReg),
    litReg(ADD, instructionType[ADD].litReg)
]);

const sub = Arc.choice([
    regReg(SUB, instructionType[SUB].regReg),
    regLit(SUB, instructionType[SUB].regLit),
    litReg(SUB, instructionType[SUB].litReg),
]);

const mul = Arc.choice([
    regReg(MUL, instructionType[MUL].regReg),
    litReg(MUL, instructionType[MUL].litReg)
]);

const and = Arc.choice([
    regReg(AND, instructionType[AND].regReg),
    litReg(AND, instructionType[AND].litReg)
]);

const or = Arc.choice([
    regReg(OR, instructionType[OR].regReg),
    litReg(OR, instructionType[OR].litReg)
]);

const xor = Arc.choice([
    regReg(XOR, instructionType[XOR].regReg),
    litReg(XOR, instructionType[XOR].litReg)
]);

const lsl = Arc.choice([
    regReg(LSL, instructionType[LSL].regReg),
    regLit(LSL, instructionType[LSL].regLit)
]);

const lsr = Arc.choice([
    regReg(LSR, instructionType[LSR].regReg),
    regLit(LSR, instructionType[LSR].regLit)
]);

const inc = singleReg(INC, instructionType[INC].singleReg);
const dec = singleReg(DEC, instructionType[DEC].singleReg);
const not = singleReg(NOT, instructionType[NOT].singleReg);

const jeq = Arc.choice([
    regMem(JEQ, instructionType[JEQ].regMem),
    litMem(JEQ, instructionType[JEQ].litMem)
]);

const jne = Arc.choice([
    regMem(JNE, instructionType[JNE].regMem),
    litMem(JNE, instructionType[JNE].litMem)
]);

const jlt = Arc.choice([
    regMem(JLT, instructionType[JLT].regMem),
    litMem(JLT, instructionType[JLT].litMem)
]);

const jgt = Arc.choice([
    regMem(JGT, instructionType[JGT].regMem),
    litMem(JGT, instructionType[JGT].litMem)
]);

const jle = Arc.choice([
    regMem(JLE, instructionType[JLE].regMem),
    litMem(JLE, instructionType[JLE].litMem)
]);

const jge = Arc.choice([
    regMem(JGE, instructionType[JGE].regMem),
    litMem(JGE, instructionType[JGE].litMem)
]);

const psh = Arc.choice([
    singleLit(PSH, instructionType[PSH].singleLit),
    singleReg(PSH, instructionType[PSH].singleReg)
]);

const pop = singleReg(POP, instructionType[POP].singleReg);

const cal = Arc.choice([
    singleLit(CAL, instructionType[CAL].singleLit),
    singleReg(CAL, instructionType[CAL].singleReg)
]);

const ret = noArgs(RET, instructionType[RET].noArgs);
const hlt = noArgs(HLT, instructionType[HLT].noArgs);

export const instruction = Arc.choice([
    mov,

    add,
    sub,
    mul,
    or,
    and,
    xor,
    not,
    lsl,
    lsr,

    inc,
    dec,
    
    jne,
    jeq,
    jlt,
    jgt,
    jle,
    jge,
    
    psh,
    pop,
    cal,
    ret,
    hlt
]);