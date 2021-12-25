import { assert, expect } from "chai";
import { Ok, ParserState } from "../assembler/parser/arc/types";
import { IReturn } from "../assembler/parser/instructions/generic";
import { instruction } from "../assembler/parser/instructions/instructions";
import { ParserTypes } from "../assembler/parser/util";
import { instructions, movTests, stackTests } from "./cases/index";
import { testType } from "./cases/stack";

const resultOK = (result: ParserState<IReturn, any>): result is Ok<any> => {
    return (!result.isError);
}

const testArg = (result, expected, oneArg = testType.DOUBLE_ARG) => {
    if (!resultOK(result)) {
        assert.fail(result.isError, false, "Encountered error while parsing statement.");
    }

    const { type, value } = result.result;
    expect(type).equal(ParserTypes.INSTRUCTION);
    expect(value.instruction).equal(expected.instructionType);

    if (oneArg == testType.NO_ARG) { return; }

    const [arg1, arg2] = value.args;
    expect(arg1.type).equal(expected.arg1.type);
    expect(arg1.value).equal(expected.arg1.value);

    if (oneArg == testType.SINGLE_ARG) { return; }
    expect(arg2.type).equal(expected.arg2.type);
    expect(arg2.value).equal(expected.arg2.value);
}

describe("mov", () => {
    const tests = movTests;
    tests.forEach(({ name, statement, expected }) => {
        it(name, () => {
            const result = instruction.run(statement);
    
            if (!resultOK(result)) {
                assert.fail(result.isError, false, "Encountered error while parsing statement.");
            }
    
            const { type, value } = result.result;
            testArg(result, expected);

            // Lit offset instruction
            if (value.args.length === 3 && expected.arg3) {
                const arg3 = value.args[2];
                expect(arg3.type).equal(expected.arg3.type);
                expect(arg3.value).equal(expected.arg3.value);
            }
        });
    });
});


const singleArg = ["inc", "dec", "not"]
Object.keys(instructions).map(name => {
    describe(name, () => {
        const tests = instructions[name];
        tests.forEach(({ name, statement, expected }) => {
            it(name, () => {
                const result = instruction.run(statement);
    
                if (!resultOK(result)) {
                    assert.fail(result.isError, false, "Encountered error while parsing statement.");
                }
    
                const oneArg = singleArg.includes(name) ?
                    testType.SINGLE_ARG : testType.DOUBLE_ARG;
                testArg(result, expected, oneArg);
            });
        });
    });
});

describe("stack", () => {
    const tests = stackTests;
    tests.forEach(({ name, statement, expected, type }) => {
        it(name, () => {
            const result = instruction.run(statement);

            if (!resultOK(result)) {
                assert.fail(result.isError, false, "Encountered error while parsing statement.");
            }

            testArg(result, expected, type);
        })
    })
});
