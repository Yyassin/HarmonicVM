import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "sub_reg_reg",
        statement: "sub r3, r5",
        expected: {
            instructionType: Instruction.SUB_RX_RY,
            outcome: -2 + 2 ** 16, // Unsigned
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r3"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r5"
            }
        }
    },
    {
        name: "sub_lit_reg",
        statement: "add $1, r2",
        expected: {
            instructionType: Instruction.ADD_LIT_REG,
            outcome: 3,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "1"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r2"
            }
        }
    },
    {
        name: "sub_reg_lit",
        statement: "sub r3, $a",
        expected: {
            instructionType: Instruction.SUB_REG_LIT,
            outcome: 7,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r3"
            },
            arg2: {
                type: ParserTypes.HEX_LITERAL,
                value: "a"
            },
        }
    }
];
