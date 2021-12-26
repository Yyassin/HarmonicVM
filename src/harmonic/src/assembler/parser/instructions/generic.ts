import Arc from "../../parser/arc/index";
import { Parser as IParser } from "../../parser/arc/index";
import { Instruction, InstructionMnemonic } from "../../../cpu/instructions";
import { address, hexLiteral, register, upperOrLowerStr } from "../common";
import { squareBracketExpr } from "../expressions";
import { parserTypes } from "../parserTypes";
import { ParserTypes } from "../util";

/* Types */
export interface IReturn  { type: ParserTypes; value: any; }                                        // Parser return value types
type Parser = IParser<IReturn, string>;                                                             // Generic Parser
const contextual = (arg: () => Generator<any, IReturn, any>) => Arc.contextual<IReturn>(arg);       // Contextual Typecast

/**
 * Matches and wraps a literal + register instruction of the form
 * MNEMONIC ${LITERAL}, REGISTER 
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const litReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);        // Match the mnemonic
    yield Arc.whitespace;                   // Must be followed by whitespace

    const arg1 = yield Arc.choice([         // Match the literal (can be an expression)
        hexLiteral,
        squareBracketExpr
    ]);

    yield Arc.optionalWhitespace;           // Match comma
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const arg2 = yield register;            // Match the register, followed by any whitespace/commas
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({        // Return the wrapped instruction
        instruction: type,
        args: [arg1, arg2]
    });
});

/**
 * Matches and wraps a register + literal instruction of the form
 * MNEMONIC REGISTER, ${LITERAL} 
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const regLit = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const arg1 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const arg2 = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [arg1, arg2]
    });
});

/**
 * Matches and wraps a register + register instruction of the form
 * MNEMONIC REGISTER, REGISTER
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const regReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r2 = yield register;
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [r1, r2]
    });
});

/**
 * Matches and wraps a register + address instruction of the form
 * MNEMONIC REGISTER, &[MEMORY ADDRESS]
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const regMem = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    // &4 or &[...]
    const addr = yield Arc.choice([
        address,
        Arc.char('&').chain(() => squareBracketExpr)
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [r1, addr]
    });
});

/**
 * Matches and wraps an address + literal instruction of the form
 * MNEMONIC &[MEMORY ADDRESS], REGISTER
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const memReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    // &4 or &[...]
    const addr = yield Arc.choice([
        address,
        Arc.char('&').chain(() => squareBracketExpr)
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r1 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [addr, r1]
    });
});

/**
 * Matches and wraps a literal + adress instruction of the form
 * MNEMONIC ${LITERAL}, &[MEMORY ADDRESS]
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const litMem = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const lit = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    const addr = yield Arc.choice([
        address,
        Arc.char('&').chain(() => squareBracketExpr)
    ]);

    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: [lit, addr]
    });
});

/**
 * Matches and wraps a register + register (as memory index) instruction of the form
 * MNEMONIC &REGISTER, REGISTER
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const regIndReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield Arc.char('&').chain(() => register);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r2 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [r1, r2]
    });
});

/**
 * Matches and wraps a literal + register + register instruction of the form
 * MNEMONIC ${LITERAL} , &REGISTER, REGISTER
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const litOffReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const lit = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r1 = yield Arc.char('&').chain(() => register);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r2 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [lit, r1, r2]
    });
});

/**
 * Matches and wraps an instruction with no arguments of the form
 * MNEMONIC
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const noArgs = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: []
    });
});

/**
 * Matches and wraps a single register instruction of the form
 * MNEMONIC REGISTER 
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const singleReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield register;
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [r1]
    });
});

/**
 * Matches and wraps a single  literal instruction of the form
 * MNEMONIC ${LITERAL} 
 * for the specified instruction type.
 * @param mnemonic InstructionMnemonic, the instruction mnemonic.
 * @param type Instruction, the specific instruction type to wrap.
 * @returns Parser, the wrapped litReg parser.
 */
const singleLit = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const lit = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [lit]
    });
});

export {
    litReg,
    regLit,
    regReg,
    regMem,
    memReg,
    litMem,
    regIndReg,
    litOffReg,
    noArgs,
    singleReg,
    singleLit
}
