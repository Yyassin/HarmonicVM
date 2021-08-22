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
    SUB_LIT_REG=        "SUB_LIT_REG",
    SUB_REG_REG=        "SUB_REG_REG",
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
        regReg:  Instruction.SUB_REG_REG,
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
        litReg: Instruction.LSL_REG_LIT
    },
    [InstructionMnemonic.LSR]: {
        regReg: Instruction.LSR_REG_REG,
        litReg: Instruction.LSR_REG_LIT
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

const instructions: Record<Instruction, number> = {
    [Instruction.MOV_LIT_RD]:         0x10,
    [Instruction.MOV_RS_RD]:          0x11,
    [Instruction.STR_RS_MEM]:         0x12,
    [Instruction.LDR_MEM_RD]:         0x13,
    [Instruction.STR_LIT_MEM]:        0x1B,
    [Instruction.LDR_REG_IND_REG]:    0x1C,
    [Instruction.LDR_LIT_OFF_REG]:    0x1D,
    
    [Instruction.ADD_RX_RY]:          0x14,
    [Instruction.ADD_LIT_REG]:        0x3F,
    [Instruction.SUB_LIT_REG]:        0x16,
    [Instruction.SUB_REG_REG]:        0x1E,
    [Instruction.SUB_RX_RY]:          0x1F,
    [Instruction.INC_REG]:            0x35,
    [Instruction.DEC_REG]:            0x36,
    [Instruction.MUL_LIT_REG]:        0x20,
    [Instruction.MUL_REG_REG]:        0x21,

    [Instruction.LSL_REG_LIT]:        0x26,
    [Instruction.LSL_REG_REG]:        0x27,
    [Instruction.LSR_REG_LIT]:        0x2A,
    [Instruction.LSR_REG_REG]:        0x2B,
    [Instruction.AND_REG_LIT]:        0x2E,   
    [Instruction.AND_REG_REG]:        0x2F,
    [Instruction.OR_REG_LIT]:         0x30,
    [Instruction.OR_REG_REG]:         0x31,
    [Instruction.XOR_REG_LIT]:        0x32,
    [Instruction.XOR_REG_REG]:        0x33,
    [Instruction.NOT]:                0x34,   

    [Instruction.JMP_NOT_EQ]:         0x15,
    [Instruction.JNE_REG]:            0x40,
    [Instruction.JEQ_REG]:            0x3E,
    [Instruction.JEQ_LIT]:            0x41,
    [Instruction.JLT_REG]:            0x42,   
    [Instruction.JLT_LIT]:            0x43,
    [Instruction.JGT_REG]:            0x44,
    [Instruction.JGT_LIT]:            0x45,
    [Instruction.JLE_REG]:            0x46,
    [Instruction.JLE_LIT]:            0x47,
    [Instruction.JGE_REG]:            0x48,
    [Instruction.JGE_LIT]:            0x49,

    [Instruction.PSH_LIT]:            0x17,
    [Instruction.PSH_RS]:             0x18,
    [Instruction.POP]:                0x1A,
    [Instruction.CAL_LIT]:            0x5E,
    [Instruction.CAL_RS]:             0x5F,
    [Instruction.RET]:                0x60,
    [Instruction.HLT]:                0xFF
} as const;

export default instructions;
