import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "lsl_reg_reg",
        statement: "lsl r1, r4",
        expected: {
            instructionType: Instruction.LSL_REG_REG,
            outcome: 1 << 4,
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
        name: "lsl_reg_lit",
        statement: "lsl r6, $ABCD",
        expected: {
            instructionType: Instruction.LSL_REG_LIT,
            outcome: 6 << 0xabcd,
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
