import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "mul_reg_reg",
        statement: "mul r7, r7",
        expected: {
            instructionType: Instruction.MUL_REG_REG,
            outcome: 7 * 7,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r7"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r7"
            }
        }
    },
    {
        name: "mul_lit_reg",
        statement: "mul $1337, r6",
        expected: {
            instructionType: Instruction.MUL_LIT_REG,
            outcome: 0x1337 * 6,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "1337"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r6"
            }
        }
    }
];
