import { assemblyParser as parser } from "./parser/index";
import instructionsMeta, { InstructionTypes as I } from "../cpu/instructions";
import { reg } from "../cpu/programs";
import { deepLog, ParserTypes } from "./parser/util";
import { IReturn } from "./parser/instructions/generic";

// const exampleProgram = [
//     "mov $1232, r0",
//     "mov $4200, r1",
//     "mov r1, &0060",
//     "mov $1300, r1",
//     "mov &0060, r2",
//     "add r1, r2"
// ].join("\n");

// Big Endian
let machineCode = [] as number[];
let parsedInstructions = [] as any[];
let labels = {};
let structures = {};

//TODO: Add binary expression support
const getNodeValue = node => {
    switch(node.type) {
        case ParserTypes.VARIABLE: {
            if (!(node.value in labels)) {
                throw new Error(`Label ${node.value} wasn't resolved.`)
            }
            return labels[node.value];
        }

        case ParserTypes.INTERPRET_AS: {
            const structure = structures[node.value.structureName];

            if (!structure) {
                throw new Error(`structure "${node.value.structure}" could not be resolved.`);
            }

            const member = structure.members[node.value.property];
            if (!member) {
                throw new Error(
                    `propery "${node.value.property}" in structure "${node.value.structure}" could not be resolved.`
                )
            }

            if (!(node.value.symbol in labels)) {
                throw new Error(`symbol ${node.value.symbol} could not be resolved.`)
            }
            
            const symbol = labels[node.value.symbol];
            return symbol + member.offset;
        }

        case ParserTypes.HEX_LITERAL: {
            return  parseInt(node.value, 16);
        }
        
        case ParserTypes.ADDRESS: {
            return  parseInt(node.value, 16);
        }

        default: {
            throw new Error(`Unsupported node type: ${node.type}`);
        }
    }
}

const encodeHexLitorMem = expressionNode => {
    const hexVal = getNodeValue(expressionNode);
    const highByte = (hexVal & 0xff00) >> 8;
    const lowByte = hexVal & 0x00ff;
    machineCode.push(highByte, lowByte);
}

const encodeHexLit8 = expressionNode => {
    const hexVal = getNodeValue(expressionNode);
    const lowByte = hexVal & 0x00ff;
    machineCode.push(lowByte);
}

const encodeReg = register => {
    const mappedReg = reg[register.value.toUpperCase()];
    machineCode.push(mappedReg);
}

const encodeData8 = node => {
    node.value.values.map(byte => {
        const parsedValue = parseInt(byte.value, 16);
        machineCode.push(parsedValue & 0xff);
    })
}
const encodeData16 = node => {
    node.value.values.map(byte => {
        const parsedValue = parseInt(byte.value, 16);
        machineCode.push((parsedValue & 0xff00) >> 8);
        machineCode.push(parsedValue & 0x00ff);
    })
}

const nameCollision = (name) => name in labels || name in structures;

export const assemble = (assemblyCode) => {
    machineCode = [] as number[];
    parsedInstructions = [];
    labels = {};
    structures = {};
    
    const parsedOutput = parser.run(assemblyCode);
    const ast = parsedOutput.result.filter(node => typeof node !== "string")
    
    if (parsedOutput.isError) {
        throw new Error(parsedOutput.error);
    }

    /*** Compiler ***/
    let currentAddress = 0;
    //deepLog(parsedOutput)
    if ("result" in parsedOutput) { 
        // Parse labels on first run so they don't need to be defined sequentially.
        ast.forEach(node => {
            switch(node.type) {
                case ParserTypes.LABEL: {
                    if (nameCollision(node.value)) {
                        throw new Error(
                            `Can't create label "${node.value}" because it has already been declared.`
                        )
                    }

                    labels[node.value] = currentAddress;
                    return;
                }
                    
                case ParserTypes.CONSTANT: {
                    if (nameCollision(node.value.name)) {
                        throw new Error(
                            `Can't create constant "${node.value.name}" because it has already been declared.`
                        )
                    }

                    labels[node.value.name] = parseInt(node.value.value.value, 16) & 0xffff;
                    return;
                }

                case ParserTypes.DATA: {
                    if (nameCollision(node.value)) {
                        throw new Error(
                            `Can't create data "${node.value}" because it has already been declared.`
                        )
                    }

                    labels[node.value.name] = currentAddress;
                    const valueSizeInBytes = (node.value.size === 16) ? 2: 1;
                    const totalBytes = node.value.values.length * valueSizeInBytes;
                    currentAddress += totalBytes;
                    return;
                }

                case ParserTypes.STRUCTURE: {
                    if (nameCollision(node.value.name)) {
                        throw new Error(
                            `Can't create structure "${node.value.name}" because it has already been declared.`
                        )
                    }

                    structures[node.value.name] = {
                        members: {}
                    };

                    let offset = 0;
                    node.value.members.map(({key, value}) => {
                        structures[node.value.name].members[key] = {
                            offset,
                            size: parseInt(value.value, 16) & 0xffff
                        }

                        offset += structures[node.value.name].members[key].size;
                    })

                    return;
                }

                default: {
                    const metaData = instructionsMeta[node.value.instruction];
                    currentAddress += metaData.size;
                    return;
                }
            }
        });

        const isAccountedFor = (node) => ((node.type === ParserTypes.LABEL) || (node.type === ParserTypes.CONSTANT) || (node.type === ParserTypes.STRUCTURE));
        let pointerIndex = 0;
        ast.forEach(node => {
            // Update labels
            if (isAccountedFor(node)) { return; }
            else if (node.type === ParserTypes.DATA) {
                if (node.value.size === 8) {
                    encodeData8(node);
                } else {
                    encodeData16(node);
                }
                return;
            }

            // It's a instruction, update the address by + size
            const metaData = instructionsMeta[node.value.instruction];
            machineCode.push(metaData.opCode);

            parsedInstructions.push({
                instruction: metaData.instruction,
                args: node.value.args.map(arg => {
                    if (isNaN(parseInt(arg.value))) return arg.value
                    return `0x${arg.value.toString(16).padStart(4, "0")}`;
                }),
                index: pointerIndex
            })
            pointerIndex += metaData.size;

            if ([I.litReg, I.memReg].includes(metaData.type)) {
                encodeHexLitorMem(node.value.args[0]);
                encodeReg(node.value.args[1]);
            } 
            else if ([I.regLit, I.regMem].includes(metaData.type)) {
                encodeReg(node.value.args[0]);
                encodeHexLitorMem(node.value.args[1]);
            }
            else if (I.regLit8 === metaData.type) {
                encodeReg(node.value.args[0]);
                encodeHexLit8(node.value.args[1]);
            }
            else if ([I.regReg, I.regIndReg].includes(metaData.type)) {
                encodeReg(node.value.args[0]);
                encodeReg(node.value.args[1]);
            }
            else if(I.litMem === metaData.type) {
                encodeHexLitorMem(node.value.args[0]);
                encodeHexLitorMem(node.value.args[1]);
            }
            else if (I.litOffReg === metaData.type) {
                encodeHexLitorMem(node.value.args[0]);
                encodeReg(node.value.args[1]);
                encodeReg(node.value.args[2]);
            }
            else if (I.singleReg === metaData.type) {
                encodeReg(node.value.args[0]);
            }
            else if (I.singleLit === metaData.type) {
                encodeHexLitorMem(node.value.args[0]);
            } else { 
                // No args
            }
        })
    }
    // console.log(parsedInstructions)
    // console.log(machineCode)
    // console.log(machineCode.map(value => `0x${value.toString(16).padStart(2, "0")}`).join(" "));

    return { assembled: machineCode, parsedInstructions };
}

//console.log(assemble(exampleProgram));

// const exampleProgram = `
// constant code_constant = $C0DE

// +data8 bytes = { $01, $02, $03, $04 }
// data16 words = { $0506, $0708, $090A, $0B0C }

// code:
//     mov [!code_constant], &1234
// `.trim();

// const exampleProgram = `
// data16 myRectangle = { $A3, $1B, $04, $10 }

// structure Rectangle {
//     x: $2,
//     y: $2,
//     w: $2,
//     h: $2
// }

// start:
//     mov &[ <Rectangle> myRectangle.y ], r1

// `.trim();
