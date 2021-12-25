import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "xor_reg_reg",
        statement: "xor r3, r7",
        expected: {
            instructionType: Instruction.XOR_REG_REG,
            outcome: 3 ^ 7,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r3"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r7"
            }
        }
    },
    {
        name: "xor_reg_lit",
        statement: "xor r6, $C0DE",
        expected: {
            instructionType: Instruction.XOR_REG_LIT,
            outcome: 6 ^ 0xc0de,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r6"
            },
            arg2: {
                type: ParserTypes.HEX_LITERAL,
                value: "C0DE"
            }
        }
    }
];
