import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "not",
        statement: "not r4",
        expected: {
            instructionType: Instruction.NOT,
            outcome: ~4 + 2 ** 16,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    }
];
