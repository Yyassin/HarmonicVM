import { assert, expect } from "chai";
import { Ok, ResultType } from "../assembler/parser/arc/types";
import { instruction } from "../assembler/parser/instructions/instructions";
import { ParserTypes } from "../assembler/parser/util";
import { movTests } from "./cases/index";

const resultOK = (result: ResultType<any, any>): result is Ok<any> => {
    return (!result.isError);
}

describe("mov", () => {
    const tests = movTests;
    tests.forEach(({ name, statement, expected }) => {
        it(name, () => {
            const result = instruction.run(statement);
    
            // if (!resultOK(result)) {
            //     assert.fail(result.isError, false, "Encountered error while parsing statement.");
            // }
    
            const { type, value } = result.result;
            expect(type).equal(ParserTypes.INSTRUCTION);
            expect(value.instruction).equal(expected.instructionType);
    
            const [arg1, arg2] = value.args;
            expect(arg1.type).equal(expected.arg1.type);
            expect(arg1.value).equal(expected.arg1.value);
            expect(arg2.type).equal(expected.arg2.type);
            expect(arg2.value).equal(expected.arg2.value);

            // Lit offset instruction
            if (value.args.length === 3 && expected.arg3) {
                const arg3 = value.args[2];
                expect(arg3.type).equal(expected.arg3.type);
                expect(arg3.value).equal(expected.arg3.value);
            }
        });
    });
});

// make one/two or nested complex brackets