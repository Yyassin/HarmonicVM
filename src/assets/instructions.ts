import { litReg } from "../assembler/parser/instructions/generic";

export enum InstructionTypes {
    litReg="litReg",
    regLit="regLit",
    regLit8="regLit8",
    regReg="regReg",
    regMem="regMem",
    memReg="memReg", 
    litMem="litMem",
    regIndReg="regIndReg",
    litOffReg="litOffReg",
    noArgs="noArgs",
    singleReg="singleReg",
    singleLit="singleLit"
};

type InstructionSize = {[key in InstructionTypes]: number };
const instructionSize: InstructionSize = {
    [InstructionTypes.litReg]: 4,
    [InstructionTypes.regLit]: 4,
    [InstructionTypes.regLit8]: 3,
    [InstructionTypes.regReg]: 3,
    [InstructionTypes.regMem]: 4,
    [InstructionTypes.memReg]: 4,
    [InstructionTypes.litMem]: 5,
    [InstructionTypes.regIndReg]: 3,
    [InstructionTypes.litOffReg]: 5,
    [InstructionTypes.noArgs]: 1,
    [InstructionTypes.singleReg]: 2,
    [InstructionTypes.singleLit]: 3,
}

export enum InstructionMnemonic {
    MOV="mov",
    // LDR="ldr",
    // STR="str",
    
    ADD="add",
    SUB="sub",
    MUL="mul",
    OR="or",
    AND="and",
    XOR="xor",
    NOT="not",

    LSL="lsl",
    LSR="lsr",

    INC="inc",
    DEC="dec",

    JNE="jne",
    JEQ="jeq",
    JLT="jlt",
    JGT="jgt",
    JLE="jle",
    JGE="jge",

    PSH="psh",
    POP="pop",
    CAL="cal",
    RET="ret",
    HLT="hlt"
};

export enum Instruction {
    MOV_LIT_RD=         "MOV_LIT_RD",
    MOV_RS_RD=          "MOV_RS_RD",
    STR_RS_MEM=         "STR_RS_MEM",
    LDR_MEM_RD=         "LDR_MEM_RD",
    STR_LIT_MEM=        "STR_LIT_MEM",
    LDR_REG_IND_REG=    "LDR_REG_IND_REG",
    LDR_LIT_OFF_REG=    "LDR_LIT_OFF_REG",
    
    ADD_RX_RY=          "ADD_RX_RY",
    ADD_LIT_REG=        "ADD_LIT_REG",
    SUB_REG_LIT=        "SUB_REG_LIT",
    SUB_LIT_REG=        "SUB_LIT_REG",
    SUB_RX_RY=          "SUB_RX_RY",
    INC_REG=            "INC_REG",
    DEC_REG=            "DEC_REG",
    MUL_LIT_REG=        "MUL_LIT_REG",
    MUL_REG_REG=        "MUL_REG_REG",

    LSL_REG_LIT=        "LSL_REG_LIT",
    LSL_REG_REG=        "LSL_REG_REG",
    LSR_REG_LIT=        "LSR_REG_LIT",
    LSR_REG_REG=        "LSR_REG_REG",
    AND_REG_LIT=        "AND_REG_LIT",   
    AND_REG_REG=        "AND_REG_REG",
    OR_REG_LIT=         "OR_REG_LIT",
    OR_REG_REG=         "OR_REG_REG",
    XOR_REG_LIT=        "XOR_REG_LIT",
    XOR_REG_REG=        "XOR_REG_REG",
    NOT=                "NOT",   

    JMP_NOT_EQ=         "JMP_NOT_EQ",
    JNE_REG=            "JNE_REG",
    JEQ_REG=            "JEQ_REG",
    JEQ_LIT=            "JEQ_LIT",
    JLT_REG=            "JLT_REG",   
    JLT_LIT=            "JLT_LIT",
    JGT_REG=            "JGT_REG",
    JGT_LIT=            "JGT_LIT",
    JLE_REG=            "JLE_REG",
    JLE_LIT=            "JLE_LIT",
    JGE_REG=            "JGE_REG",
    JGE_LIT=            "JGE_LIT",

    PSH_LIT=            "PSH_LIT",
    PSH_RS=             "PSH_RS",
    POP=                "POP",
    CAL_LIT=            "CAL_LIT",
    CAL_RS=             "CAL_RS",
    RET=                "RET",
    HLT=                "HLT"
};

export const instructionType = {
    [InstructionMnemonic.MOV]: {
        regReg:     Instruction.MOV_RS_RD,
        litReg:     Instruction.MOV_LIT_RD,
        memReg:     Instruction.LDR_MEM_RD,
        regMem:     Instruction.STR_RS_MEM,
        litMem:     Instruction.STR_LIT_MEM,
        regIndReg:   Instruction.LDR_REG_IND_REG,
        litOffReg:   Instruction.LDR_LIT_OFF_REG,
    },
    [InstructionMnemonic.ADD]: {
        regReg:  Instruction.ADD_RX_RY,
        litReg:  Instruction.ADD_LIT_REG
    },
    [InstructionMnemonic.SUB]: {
        regReg:  Instruction.SUB_RX_RY,
        regLit:  Instruction.SUB_REG_LIT,
        litReg:  Instruction.SUB_LIT_REG
    },
    [InstructionMnemonic.MUL]: {
        regReg:  Instruction.MUL_REG_REG,
        litReg:  Instruction.MUL_LIT_REG
    },
    [InstructionMnemonic.AND]: {
        regReg:  Instruction.AND_REG_REG,
        litReg:  Instruction.AND_REG_LIT
    },
    [InstructionMnemonic.OR]: {
        regReg:  Instruction.OR_REG_REG,
        litReg:  Instruction.OR_REG_LIT
    },
    [InstructionMnemonic.XOR]: {
        regReg:  Instruction.XOR_REG_REG,
        litReg:  Instruction.XOR_REG_LIT
    },
    [InstructionMnemonic.LSL]: {
        regReg: Instruction.LSL_REG_REG,
        regLit: Instruction.LSL_REG_LIT
    },
    [InstructionMnemonic.LSR]: {
        regReg: Instruction.LSR_REG_REG,
        regLit: Instruction.LSR_REG_LIT
    },
    [InstructionMnemonic.INC]: {
        singleReg: Instruction.INC_REG
    },
    [InstructionMnemonic.DEC]: {
        singleReg: Instruction.DEC_REG
    },
    [InstructionMnemonic.NOT]: {
        singleReg: Instruction.NOT
    },
    [InstructionMnemonic.JEQ]: {
        regMem: Instruction.JEQ_REG,
        litMem: Instruction.JEQ_LIT
    },
    [InstructionMnemonic.JNE]: {
        regMem: Instruction.JNE_REG,
        litMem: Instruction.JMP_NOT_EQ
    },
    [InstructionMnemonic.JLT]: {
        regMem: Instruction.JLT_REG,
        litMem: Instruction.JLT_LIT
    },
    [InstructionMnemonic.JGT]: {
        regMem: Instruction.JGT_REG,
        litMem: Instruction.JGT_LIT
    },
    [InstructionMnemonic.JLT]: {
        regMem: Instruction.JLT_REG,
        litMem: Instruction.JLT_LIT
    },
    [InstructionMnemonic.JGT]: {
        regMem: Instruction.JGT_REG,
        litMem: Instruction.JGT_LIT
    },
    [InstructionMnemonic.JLE]: {
        regMem: Instruction.JLE_REG,
        litMem: Instruction.JLE_LIT
    },
    [InstructionMnemonic.JGE]: {
        regMem: Instruction.JGE_REG,
        litMem: Instruction.JGE_LIT
    },
    [InstructionMnemonic.PSH]: {
        singleReg: Instruction.PSH_RS,
        singleLit: Instruction.PSH_LIT
    },
    [InstructionMnemonic.POP]: {
        singleReg: Instruction.PSH_RS
    },
    [InstructionMnemonic.CAL]: {
        singleReg: Instruction.CAL_RS,
        singleLit: Instruction.CAL_LIT
    },
    [InstructionMnemonic.RET]: {
        noArgs: Instruction.RET
    },
    [InstructionMnemonic.HLT]: {
        noArgs: Instruction.HLT
    }
} as const;

type InstructionMeta = {
    [key in Instruction]: {
        instruction: Instruction,
        opCode: number,
        type: InstructionTypes,
        size: number,
        mnemonic: InstructionMnemonic
    }
};

const getMeta = (instructionType: InstructionTypes) => ({
    type: InstructionTypes[instructionType],
    size: instructionSize[instructionType]
});

const instructionsMeta: InstructionMeta = {
    [Instruction.MOV_LIT_RD]: {
        instruction: Instruction.MOV_LIT_RD,
        opCode: 0x10,
        ...getMeta(InstructionTypes.litReg),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.MOV_RS_RD]: {
        instruction: Instruction.MOV_RS_RD,
        opCode: 0x11,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.STR_RS_MEM]: {
        instruction: Instruction.STR_RS_MEM,
        opCode: 0x12,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.LDR_MEM_RD]: {
        instruction: Instruction.LDR_MEM_RD,
        opCode: 0x13,
        ...getMeta(InstructionTypes.memReg),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.STR_LIT_MEM]: {
        instruction: Instruction.STR_LIT_MEM,
        opCode: 0x1B,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.LDR_REG_IND_REG]: {
        instruction: Instruction.LDR_REG_IND_REG,
        opCode: 0x1C,
        ...getMeta(InstructionTypes.regIndReg),
        mnemonic: InstructionMnemonic.MOV
    },
    [Instruction.LDR_LIT_OFF_REG]: {
        instruction: Instruction.LDR_LIT_OFF_REG,
        opCode: 0x1D,
        ...getMeta(InstructionTypes.litOffReg),
        mnemonic: InstructionMnemonic.MOV
    },

    [Instruction.ADD_RX_RY]: {
        instruction: Instruction.ADD_RX_RY,
        opCode: 0x14,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.ADD
    },
    [Instruction.ADD_LIT_REG]: {
        instruction: Instruction.ADD_LIT_REG,
        opCode: 0x3F,
        ...getMeta(InstructionTypes.litReg),
        mnemonic: InstructionMnemonic.ADD
    },
    [Instruction.SUB_LIT_REG]: {
        instruction: Instruction.SUB_LIT_REG,
        opCode: 0x16,
        ...getMeta(InstructionTypes.litReg),
        mnemonic: InstructionMnemonic.SUB
    },
    [Instruction.SUB_REG_LIT]: {
        instruction: Instruction.SUB_REG_LIT,
        opCode: 0x1E,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.SUB
    },
    [Instruction.SUB_RX_RY]: {
        instruction: Instruction.SUB_RX_RY,
        opCode: 0x1F,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.SUB
    },
    [Instruction.INC_REG]: {
        instruction: Instruction.INC_REG,
        opCode: 0x35,
        ...getMeta(InstructionTypes.singleReg),
        mnemonic: InstructionMnemonic.INC
    },
    [Instruction.DEC_REG]: {
        instruction: Instruction.DEC_REG,
        opCode: 0x36,
        ...getMeta(InstructionTypes.singleReg),
        mnemonic: InstructionMnemonic.DEC
    },
    [Instruction.MUL_LIT_REG]: {
        instruction: Instruction.MUL_LIT_REG,
        opCode: 0x20,
        ...getMeta(InstructionTypes.litReg),
        mnemonic: InstructionMnemonic.MUL
    },
    [Instruction.MUL_REG_REG]: {
        instruction: Instruction.MUL_REG_REG,
        opCode: 0x21,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.MUL
    },

    [Instruction.LSL_REG_LIT]: {
        instruction: Instruction.LSL_REG_LIT,
        opCode: 0x26,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.LSL
    },
    [Instruction.LSL_REG_REG]: {
        instruction: Instruction.LSL_REG_REG,
        opCode: 0x27,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.LSL
    },
    [Instruction.LSR_REG_LIT]: {
        instruction: Instruction.LSL_REG_LIT,
        opCode: 0x2A,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.LSR
    },
    [Instruction.LSR_REG_REG]: {
        instruction: Instruction.LSR_REG_REG,
        opCode: 0x2B,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.LSR
    },
    [Instruction.AND_REG_LIT]: {
        instruction: Instruction.AND_REG_LIT,
        opCode: 0x2E,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.AND
    },
    [Instruction.AND_REG_REG]: {
        instruction: Instruction.AND_REG_REG,
        opCode: 0x2F,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.AND
    },
    [Instruction.OR_REG_LIT]: {
        instruction: Instruction.OR_REG_LIT,
        opCode: 0x30,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.OR
    },
    [Instruction.OR_REG_REG]: {
        instruction: Instruction.OR_REG_REG,
        opCode: 0x31,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.OR
    },
    [Instruction.XOR_REG_LIT]: {
        instruction: Instruction.XOR_REG_LIT,
        opCode: 0x32,
        ...getMeta(InstructionTypes.regLit),
        mnemonic: InstructionMnemonic.XOR
    },
    [Instruction.XOR_REG_REG]: {
        instruction: Instruction.XOR_REG_REG,
        opCode: 0x33,
        ...getMeta(InstructionTypes.regReg),
        mnemonic: InstructionMnemonic.XOR
    },
    [Instruction.NOT]: {
        instruction: Instruction.NOT,
        opCode: 0x34,
        ...getMeta(InstructionTypes.singleReg),
        mnemonic: InstructionMnemonic.NOT
    },

    [Instruction.JMP_NOT_EQ]: {
        instruction: Instruction.JMP_NOT_EQ,
        opCode: 0x15,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.JNE
    },
    [Instruction.JNE_REG]: {
        instruction: Instruction.JNE_REG,
        opCode: 0x40,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.JNE
    },
    [Instruction.JEQ_REG]: {
        instruction: Instruction.JEQ_REG,
        opCode: 0x3E,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.JEQ
    },
    [Instruction.JEQ_LIT]: {
        instruction: Instruction.JEQ_LIT,
        opCode: 0x41,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.JEQ
    },
    [Instruction.JLT_REG]: {
        instruction: Instruction.JLT_REG,
        opCode: 0x42,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.MUL
    },
    [Instruction.JLT_LIT]: {
        instruction: Instruction.JLT_LIT,
        opCode: 0x43,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.MUL
    },
    [Instruction.JGT_REG]: {
        instruction: Instruction.JGT_REG,
        opCode: 0x44,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.JGT
    },
    [Instruction.JGT_LIT]: {
        instruction: Instruction.JGT_LIT,
        opCode: 0x45,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.JGT
    },
    [Instruction.JLE_REG]: {
        instruction: Instruction.JLE_REG,
        opCode: 0x46,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.JLE
    },
    [Instruction.JLE_LIT]: {
        instruction: Instruction.JLE_LIT,
        opCode: 0x47,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.JLE
    },
    [Instruction.JGE_REG]: {
        instruction: Instruction.JGE_REG,
        opCode: 0x48,
        ...getMeta(InstructionTypes.regMem),
        mnemonic: InstructionMnemonic.JGE
    },
    [Instruction.JGE_LIT]: {
        instruction: Instruction.JGE_LIT,
        opCode: 0x49,
        ...getMeta(InstructionTypes.litMem),
        mnemonic: InstructionMnemonic.JGE
    },

    [Instruction.PSH_LIT]: {
        instruction: Instruction.PSH_LIT,
        opCode: 0x17,
        ...getMeta(InstructionTypes.singleLit),
        mnemonic: InstructionMnemonic.PSH
    },
    [Instruction.PSH_RS]: {
        instruction: Instruction.PSH_RS,
        opCode: 0x18,
        ...getMeta(InstructionTypes.singleReg),
        mnemonic: InstructionMnemonic.PSH
    },
    [Instruction.POP]: {
        instruction: Instruction.POP,
        opCode: 0x1A,
        ...getMeta(InstructionTypes.singleLit),
        mnemonic: InstructionMnemonic.POP
    },
    [Instruction.CAL_LIT]: {
        instruction: Instruction.CAL_LIT,
        opCode: 0x5E,
        ...getMeta(InstructionTypes.singleLit),
        mnemonic: InstructionMnemonic.CAL
    },
    [Instruction.CAL_RS]: {
        instruction: Instruction.CAL_RS,
        opCode: 0x5F,
        ...getMeta(InstructionTypes.singleReg),
        mnemonic: InstructionMnemonic.CAL
    },
    [Instruction.RET]: {
        instruction: Instruction.RET,
        opCode: 0x60,
        ...getMeta(InstructionTypes.noArgs),
        mnemonic: InstructionMnemonic.RET
    },
    [Instruction.HLT]: {
        instruction: Instruction.HLT,
        opCode: 0xFF,
        ...getMeta(InstructionTypes.noArgs),
        mnemonic: InstructionMnemonic.HLT
    },
}

export default instructionsMeta;
