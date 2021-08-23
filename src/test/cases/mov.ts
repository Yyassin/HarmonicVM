import { ParserTypes } from "../../assembler/parser/util";
import { Instruction } from "../../assets/instructions";

export const tests = [
    {
        name: "mov_reg_reg",
        statement: "mov r1, r2",
        expected: {
            instructionType: Instruction.MOV_RS_RD,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r1"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r2"
            }
        }
    },
    {
        name: "mov_lit_reg",
        statement: "mov $4055, r2",
        expected: {
            instructionType: Instruction.MOV_LIT_RD,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "4055"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r2"
            }
        }
    },
    {
        name: "mov_lit_reg",
        statement: "mov [!loc], pc",
        expected: {
            instructionType: Instruction.MOV_LIT_RD,
            arg1: {
                type: ParserTypes.VARIABLE,
                value: "loc"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "pc"
            }
        }
    },
    {
        name: "mov_mem_reg",
        statement: "mov &C0DE, r4",
        expected: {
            instructionType: Instruction.LDR_MEM_RD,
            arg1: {
                type: ParserTypes.ADDRESS,
                value: "C0DE"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r4"
            }
        }
    },
    {
        name: "mov_reg_mem",
        statement: "mov r6, &06",
        expected: {
            instructionType: Instruction.STR_RS_MEM,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r6"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "06"
            }
        }
    },
    {
        name: "mov_lit_mem",
        statement: "mov $55, &777",
        expected: {
            instructionType: Instruction.STR_LIT_MEM,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "55"
            },
            arg2: {
                type: ParserTypes.ADDRESS,
                value: "777"
            }
        }
    },
    {
        name: "mov_reg_ind_reg",
        statement: "mov &r6, sp",
        expected: {
            instructionType: Instruction.LDR_REG_IND_REG,
            arg1: {
                type: ParserTypes.REGISTER,
                value: "r6"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "sp"
            }
        }
    },
    {
        name: "mov_lit_off_reg",
        statement: "mov $44, &r5, r5",
        expected: {
            instructionType: Instruction.LDR_LIT_OFF_REG,
            arg1: {
                type: ParserTypes.HEX_LITERAL,
                value: "44"
            },
            arg2: {
                type: ParserTypes.REGISTER,
                value: "r5"
            },
            arg3: {
                type: ParserTypes.REGISTER,
                value: "r5"
            }
        }
    },
]