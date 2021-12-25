import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../cpu/instructions";

export const tests = [
    {
        name: "jeq_reg",
        statement: "jeq r1, &C0DE",
        expected: {
            instructionType: Instruction.JEQ_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jeq_lit",
        statement: "jeq $0000, &C0DE",
        expected: {
            instructionType: Instruction.JEQ_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jne_reg",
        statement: "jne r1, &C0DE",
        expected: {
            instructionType: Instruction.JNE_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jne_lit",
        statement: "jne $0000, &C0DE",
        expected: {
            instructionType: Instruction.JMP_NOT_EQ,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jlt_reg",
        statement: "jlt r1, &C0DE",
        expected: {
            instructionType: Instruction.JLT_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jlt_lit",
        statement: "jlt $0000, &C0DE",
        expected: {
            instructionType: Instruction.JLT_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jgt_reg",
        statement: "jgt r1, &C0DE",
        expected: {
            instructionType: Instruction.JGT_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jgt_lit",
        statement: "jgt $0000, &C0DE",
        expected: {
            instructionType: Instruction.JGT_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jle_reg",
        statement: "jle r1, &C0DE",
        expected: {
            instructionType: Instruction.JLE_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jle_lit",
        statement: "jle $0000, &C0DE",
        expected: {
            instructionType: Instruction.JLE_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jge_reg",
        statement: "jge r1, &C0DE",
        expected: {
            instructionType: Instruction.JGE_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
    {
        name: "jge_lit",
        statement: "jge $0000, &C0DE",
        expected: {
            instructionType: Instruction.JGE_LIT,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "0000"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            }
        }
    },
];
