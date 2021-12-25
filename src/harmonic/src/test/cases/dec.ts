import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "dec",
        statement: "dec r4",
        expected: {
            instructionType: Instruction.DEC_REG,
            outcome: 3,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    }
];
