import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "inc",
        statement: "inc r4",
        expected: {
            instructionType: Instruction.INC_REG,
            outcome: 5,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    }
];
