import { assemblyParser as parser } from "./parser/index";
import instructionsMeta, { InstructionTypes as I } from "../cpu/instructions";
import { reg } from "../cpu/programs";
import { ParserTypes } from "./parser/util";

// Big Endian : MSB is stored first
let machineCode = [] as number[];           // Stores the machine code 
let parsedInstructions = [] as any[];       // Stores ast nodes
let labels = {};                            // Stores parsed label and their addresses
let structures = {};                        // Stores structures and their associated values

//TODO: Add binary expression support
/**
 * Returns the value associated with a specified label node.
 * @param node any, the node to extract the value from [literal or address].
 * @returns number, the value
 */
const getNodeValue = node => {
    switch(node.type) { 
        case ParserTypes.VARIABLE: {                                        // Return the associated value in labels, if exist
            if (!(node.value in labels)) {
                throw new Error(`Label ${node.value} wasn't resolved.`)     // Else error
            }
            return labels[node.value];
        }

        case ParserTypes.INTERPRET_AS: {                                    // Translate the member to its data value using the
            const structure = structures[node.value.structureName];         // the supplied offset. Else error.

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
            
            const symbol = labels[node.value.symbol];                       // Data member associated value
            return symbol + member.offset;                                  // Members offset off from base
        }

        case ParserTypes.HEX_LITERAL: {                                                                
            return  parseInt(node.value, 16);
        }
        
        case ParserTypes.ADDRESS: {
            return  parseInt(node.value, 16);
        }

        // Received a type that doesn't need value translation
        default: {
            throw new Error(`Unsupported node type: ${node.type}`);
        }
    }
}

/**
 * Encode a 16-bit hexadecimal literal or address.
 * @param expressionNode, the node to encode.
 */
const encodeHexLitorMem = expressionNode => {
    const hexVal = getNodeValue(expressionNode);
    const highByte = (hexVal & 0xff00) >> 8;        // Mask the top half word and store it
    const lowByte = hexVal & 0x00ff;                // Store the bottom half word
    machineCode.push(highByte, lowByte);            // Recall Big Endian (MSB first)
}

/**
 * Same as above for 8-bit words.
 * @param expressionNode, the node to encode.
 */
const encodeHexLit8 = expressionNode => {           
    const hexVal = getNodeValue(expressionNode);
    const lowByte = hexVal & 0x00ff;
    machineCode.push(lowByte);
}

/**
 * Encode a register ("index").
 * @param register, the register to encode. 
 */
const encodeReg = register => {
    const mappedReg = reg[register.value.toUpperCase()];    // Get index
    machineCode.push(mappedReg);
}

/**
 * Encodes the members of an 8-bit data member (array).
 * @param node, the node to encode.
 */
const encodeData8 = node => {
    node.value.values.map(byte => {                     // Map and push each datum
        const parsedValue = parseInt(byte.value, 16);
        machineCode.push(parsedValue & 0xff);
    })
}
/**
 * Encodes the members of a 16-bit data member (array).
 * @param node, the node to encode.
 */
const encodeData16 = node => {
    node.value.values.map(byte => {                     // Map and push each datum
        const parsedValue = parseInt(byte.value, 16);
        machineCode.push((parsedValue & 0xff00) >> 8);
        machineCode.push(parsedValue & 0x00ff);
    })
}

/**
 * Detects if there are any name collisions between labels.
 * @param name string, the name to check.
 * @returns true if collision, false otherwise.
 */
const nameCollision = (name: string) => name in labels || name in structures;

/**
 * Assembles the specified assembly code into harmonic machine code.
 * @param assemblyCode, the assembly code to assemble. 
 * @returns The machine code and parsed ast.
 */
export const assemble = (assemblyCode) => {
    // Reset storage
    machineCode = [] as number[];
    parsedInstructions = [];
    labels = {};
    structures = {};
    
    // Obtain parsed abstract syntax tree and filter out any comments (not labelled).
    const parsedOutput = parser.run(assemblyCode);
    const ast = parsedOutput.result.filter(node => typeof node !== "string")
    
    // Ensure valid parse
    if (parsedOutput.isError) {
        throw new Error(parsedOutput.error);
    }

    /*** Compiler ***/

    // First, parse labels on first run so they don't need to be defined sequentially.
    let currentAddress = 0;             // Keep track of address for label pointer
    if ("result" in parsedOutput) { 
        ast.forEach(node => {
            switch(node.type) {
                case ParserTypes.LABEL: {               // Map the label with the current address. Takes no space.
                    // Assert no collision
                    if (nameCollision(node.value)) {
                        throw new Error(
                            `Can't create label "${node.value}" because it has already been declared.`
                        )
                    }

                    labels[node.value] = currentAddress;        
                    return;
                }
                    
                case ParserTypes.CONSTANT: {            // Map the constant label with its value. Takes no space.
                    if (nameCollision(node.value.name)) {
                        throw new Error(
                            `Can't create constant "${node.value.name}" because it has already been declared.`
                        )
                    }

                    labels[node.value.name] = parseInt(node.value.value.value, 16) & 0xffff;
                    return;
                }

                case ParserTypes.DATA: {                // Map the label with the current address and increment
                                                        // by the number of members to be added
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

                case ParserTypes.STRUCTURE: {           // Map the structure label to its key value pairs and 
                                                        // their associated offsets. Takes no space.
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

                // Otherwise, it's an instruction. Update the address pointer accordingly.
                default: {
                    const metaData = instructionsMeta[node.value.instruction];
                    currentAddress += metaData.size;
                    return;
                }
            }
        });

        /**
         * Checks if a given node has been accounted for by the loop abvoe.
         * @param node, the node to check.
         * @returns true if accounted for, false otherwise.
         */
        const isAccountedFor = (node) => ((node.type === ParserTypes.LABEL) || (node.type === ParserTypes.CONSTANT) || (node.type === ParserTypes.STRUCTURE));
        
        // Now start encoding the parsed tree into machine code
        let pointerIndex = 0;   // Keep track of address for parsed instruction list (for client)
        ast.forEach(node => {

            if (isAccountedFor(node)) { return; }                   // Avoid double parsing
            else if (node.type === ParserTypes.DATA) {              // Encode data
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

            // Update instruction tree with instruction and address (for client).
            parsedInstructions.push({
                instruction: metaData.instruction,
                args: node.value.args.map(arg => {
                    if (isNaN(parseInt(arg.value))) return arg.value
                    return `0x${arg.value.toString(16).padStart(4, "0")}`;
                }),
                index: pointerIndex
            })
            pointerIndex += metaData.size;

            /** Encode each generic parsed instruction accordingly **/
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
    return { assembled: machineCode, parsedInstructions };
};
