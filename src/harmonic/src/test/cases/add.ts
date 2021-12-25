import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "add_reg_reg",
        statement: "add r7, r4",
        expected: {
            instructionType: Instruction.ADD_RX_RY,
            outcome: 11,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r7"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    },
    {
        name: "add_lit_reg",
        statement: "add $C0DE, r6",
        expected: {
            instructionType: Instruction.ADD_LIT_REG,
            outcome: 0xc0de + 0x6,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "C0DE"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r6"
            }
        }
    }
];
