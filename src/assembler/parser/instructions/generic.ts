import * as Arc from "../../../../node_modules/arcsecond/index";
import { Instruction, InstructionMnemonic } from "../../../cpu/instructions";
import { address, hexLiteral, register, upperOrLowerStr } from "../common";
import { squareBracketExpr } from "../expressions";
import { parserTypes } from "../parserTypes";
import { ParserTypes } from "../util";

type Parser = Arc.Parser<{
        type: ParserTypes;
        value: any;
    }, string, any>;

const litReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
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

    return parserTypes.instruction({
        instruction: type,
        args: [arg1, arg2]
    });
});

const regLit = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const arg2 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const arg1 = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);
    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: [arg1, arg2]
    });
});

const regReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield register;

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r2 = yield register;
    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: [r1, r2]
    });
});

const regMem = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
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

    return parserTypes.instruction({
        instruction: type,
        args: [r1, addr]
    });
});

const memReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
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

    return parserTypes.instruction({
        instruction: type,
        args: [addr, r1]
    });
});

const litMem = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const lit = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

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

const regIndReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield Arc.char('&').chain(() => register);

    yield Arc.optionalWhitespace;
    yield Arc.char(',');
    yield Arc.optionalWhitespace;

    const r2 = yield register;

    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: [r1, r2]
    });
});

const litOffReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
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

    return parserTypes.instruction({
        instruction: type,
        args: [lit, r1, r2]
    });
});

const noArgs = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: []
    });
});

const singleReg = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const r1 = yield register;
    yield Arc.optionalWhitespace;

    return parserTypes.instruction({
        instruction: type,
        args: [r1]
    });
});

const singleLit = (mnemonic: InstructionMnemonic, type: Instruction): Parser => Arc.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield Arc.whitespace;

    const lit = yield Arc.choice([
        hexLiteral,
        squareBracketExpr
    ]);

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
