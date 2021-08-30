import { expect } from "chai";
import Arc from "../assembler/parser/arc/index";

describe("parser", () => {
    it("str", () => {
        const parser = Arc.str("hello");
        const resultOk = parser.run("hello there!");
        const expectedOk = {
            targetString: "hello there!",
            index: "hello".length,
            result: "hello",
            isError: false,
            error: null
        }
        expect(resultOk).eql(expectedOk);

        const resultError = parser.run("hey there!");
        const expectedError = {
            targetString: "hey there!",
            index: 0,
            result: null,
            isError: true,
            error: "str: Tried to match hello but got hey there!..."
        }
        expect(resultError).eql(expectedError);
    })

    it("whitespace", () => {
        const parser = Arc.whitespace;
        const result = parser.run("         hi");
        expect(result).eql({
            targetString: "         hi",
            index: "         ".length,
            result: "         ",
            isError: false,
            error: null
        });
    })

    it("contextual", () => {
        const parser = Arc.contextual(function* () {
            yield Arc.str("mov");
            yield Arc.whitespace;
        
            const arg1 = yield Arc.letters
        
            yield Arc.optionalWhitespace;
            yield Arc.char(',');
            yield Arc.optionalWhitespace;
        
            const arg2 = yield Arc.digits;
            yield Arc.optionalWhitespace;
        
            return {
                args: [arg1, arg2]
            };
        });

        const result = parser.run("mov aushduh,32904");
        expect(result).eql({
            targetString: 'mov aushduh,32904',
            index: 17,
            result: { args: [ 'aushduh', '32904' ] },
            isError: false,
            error: null
        })
    })
});