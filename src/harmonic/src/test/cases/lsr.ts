import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "lsr_reg_reg",
        statement: "lsr r1, r4",
        expected: {
            instructionType: Instruction.LSR_REG_REG,
            outcome: 1 >> 4,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    },
    {
        name: "lsr_reg_lit",
        statement: "lsr r6, $1",
        expected: {
            instructionType: Instruction.LSR_REG_LIT,
            outcome: 6 >> 1,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r6"
            },
            arg2: {
                type: ParserTypes.HEX_LITERAL,
                value: "1"
            }
        }
    }
];