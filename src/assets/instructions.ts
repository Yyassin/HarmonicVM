const instructions = {
    MOV_LIT_RD:     0x10,
    MOV_RS_RD:      0x11,
    STR_RS_MEM:     0x12,
    LDR_MEM_RD:     0x13,
    ADD_RX_RY:      0x14,
    JMP_NOT_EQ:     0x15,
    PSH_LIT:        0x17,
    PSH_RS:         0x18,
    POP:            0x1A,
    CAL_LIT:        0x5E,
    CAL_RS:         0x5F,
    RET:            0x60
}

export default instructions;
