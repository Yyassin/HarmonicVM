import Arc from "../../parser/arc/index";
import { Parser as IParser } from "../../parser/arc/index";
import { Instruction, InstructionMnemonic } from "../../../cpu/instructions";
import { address, hexLiteral, register, upperOrLowerStr } from "../common";
import { squareBracketExpr } from "../expressions";
import { parserTypes } from "../parserTypes";
import { ParserTypes } from "../util";

export interface IReturn  { type: ParserTypes; value: any; }
type Parser = IParser<IReturn, string>;
const contextual = (arg: () => Generator<any, IReturn, any>) => Arc.contextual<IReturn>(arg);

const litReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const arg1 = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const arg2 = yield register;
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: [arg1, arg2]
    });
});

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

const noArgs = (mnemonic: InstructionMnemonic, type: Instruction): Parser => contextual(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.optionalWhitespace;
    yield Arc.optionalComment;

    return parserTypes.instruction({
        instruction: type,
        args: []
    });
});

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
