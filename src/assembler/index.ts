import { assemblyParser as parser } from "./parser/index";
import instructionsMeta, { InstructionTypes as I } from "../cpu/instructions";
import { reg } from "../cpu/programs";
import { instruction } from "./parser/instructions/instructions";
import { deepLog, ParserTypes } from "./parser/util";
import { parserTypes } from "./parser/parserTypes";

// const exampleProgram = [
//     "mov $4200, r1",
//     "mov r1, &0060",
//     "mov $1300, r1",
//     "mov &0060, r2",
//     "add r1, r2"
// ].join("\n");

const exampleProgram = [
    "start:",
    "   mov $0A, &0050",
    "loop:",
    "   mov &0050, acc",
    "   dec acc",
    "   mov acc, &0050",
    "   inc r2",
    "   inc r2",
    "   inc r2",
    "   jne $00, &[!loop]",
    "end:",
    "   hlt"
].join("\n");

// Big Endian
const machineCode = [];
const labels = {};

const encodeHexLitorMem = lit => {
    let hexVal;
    if (lit.type === ParserTypes.VARIABLE) {
        if (!(lit.value in labels)) {
            throw new Error(`Label ${lit.value} wasn't resolved.`)
        }
        hexVal = labels[lit.value];
    } else {
        hexVal = parseInt(lit.value, 16);
    }

    const highByte = (hexVal & 0xff00) >> 8;
    const lowByte = hexVal & 0x00ff;
    machineCode.push(highByte, lowByte);
}

const encodeHexLit8 = lit => {
    let hexVal;
    if (lit.type === ParserTypes.VARIABLE) {
        if (!(lit.value in labels)) {
            throw new Error(`Label ${lit.value} wasn't resolved.`)
        }
        hexVal = labels[lit.value];
    } else {
        hexVal = parseInt(lit.value, 16);
    }

    const lowByte = hexVal & 0x00ff;
    machineCode.push(lowByte);
}

const encodeReg = register => {
    const mappedReg = reg[register.value.toUpperCase()];
    machineCode.push(mappedReg);
}

const parsedOutput = parser.run(exampleProgram);
deepLog(parsedOutput)
let currentAddress = 0;
if ("result" in parsedOutput) { 
    parsedOutput.result.forEach(instruction => {
        // Update labels
        if (instruction.type === ParserTypes.LABEL) {
            labels[instruction.value] = currentAddress;
            return;
        } 

        // It's a instruction, update the address by + size
        const metaData = instructionsMeta[instruction.value.instruction];
        machineCode.push(metaData.opCode);
        currentAddress += metaData.size;

        if ([I.litReg, I.memReg].includes(metaData.type)) {
            encodeHexLitorMem(instruction.value.args[0]);
            encodeReg(instruction.value.args[1]);
        } 
        else if ([I.regLit, I.regMem].includes(metaData.type)) {
            encodeReg(instruction.value.args[0]);
            encodeHexLitorMem(instruction.value.args[1]);
        }
        else if (I.regLit8 === metaData.type) {
            encodeReg(instruction.value.args[0]);
            encodeHexLit8(instruction.value.args[1]);
        }
        else if ([I.regReg, I.regIndReg].includes(metaData.type)) {
            encodeReg(instruction.value.args[0]);
            encodeReg(instruction.value.args[1]);
        }
        else if(I.litMem === metaData.type) {
            encodeHexLitorMem(instruction.value.args[0]);
            encodeHexLitorMem(instruction.value.args[1]);
        }
        else if (I.litOffReg === metaData.type) {
            encodeHexLitorMem(instruction.value.args[0]);
            encodeReg(instruction.value.args[1]);
            encodeReg(instruction.value.args[2]);
        }
        else if (I.singleReg === metaData.type) {
            encodeReg(instruction.value.args[0]);
        }
        else if (I.singleLit === metaData.type) {
            encodeHexLitorMem(instruction.value.args[0]);
        } else { 
            // No args
        }
    })
}

console.log(machineCode.join(" "));
