import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "and_reg_reg",
        statement: "and r1, r4",
        expected: {
            instructionType: Instruction.AND_REG_REG,
            outcome: 1 & 4, 
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
        name: "and_reg_lit",
        statement: "and r6, $ABCD",
        expected: {
            instructionType: Instruction.AND_REG_LIT,
            outcome: 0xabcd & 6,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r6"
            },
            arg2: {
                type: ParserTypes.HEX_LITERAL,
                value: "ABCD"
            }
        }
    }
];