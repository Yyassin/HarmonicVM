// push, pop, cal, ret, hlt
// test impl -> each rx has x and see if correct change in Proc
// test labels and consts, variables?
// int in 13

import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export enum testType {
    DOUBLE_ARG,
    SINGLE_ARG,
    NO_ARG
}

export const tests = [
    {
        name: "psh_rs",
        statement: "psh r4",
        type: testType.SINGLE_ARG,
        expected: {
            instructionType: Instruction.PSH_RS,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    },
    {
        name: "psh_lit",
        statement: "psh $0D34",
        type: testType.SINGLE_ARG,
        expected: {
            instructionType: Instruction.PSH_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0D34"
            }
        }
    },
    {
        name: "pop",
        statement: "pop r5",
        type: testType.SINGLE_ARG,
        expected: {
            instructionType: Instruction.POP,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r5"
            }
        }
    },
    {
        name: "cal_rs",
        statement: "cal r5",
        type: testType.SINGLE_ARG,
        expected: {
            instructionType: Instruction.CAL_RS,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r5"
            }
        }
    },
    {
        name: "cal_lit",
        statement: "cal $a",
        type: testType.SINGLE_ARG,
        expected: {
            instructionType: Instruction.CAL_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "a"
            }
        }
    },
    {
        name: "ret",
        statement: "ret",
        type: testType.NO_ARG,
        expected: {
            instructionType: Instruction.RET,
        }
    },
    {
        name: "hlt",
        statement: "hlt",
        type: testType.NO_ARG,
        expected: {
            instructionType: Instruction.HLT,
        }
    },
];