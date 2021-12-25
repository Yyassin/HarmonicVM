import { expect } from "chai";
import Arc from "../assembler/parser/arc/index";
import { assemblyParser } from "../assembler/parser/index";
import { deepLog, ParserTypes } from "../assembler/parser/util";

describe("parser", () => {
    it("str", () => {
        const parser = Arc.str("hello");
        const resultOk = parser.run("hello there!", false);
        const expectedOk = {
            targetString: "hello there!",
            index: "hello".length,
            result: "hello",
            isError: false,
            error: null
        }
        expect(resultOk).eql(expectedOk);

        const resultError = parser.run("hey there!", false);
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
        const result = parser.run("         hi", false);
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

    it("labels", () => {
        const statement = `
            start:
        `.trim();
    
        const { result } = assemblyParser.run(statement);
        expect(result[0].type).equals(ParserTypes.LABEL);
        expect(result[0].value).equals("start");
    });

    it("data8", () => {
        const dataValues = ['A6', 'B5', "BB"];
        const data = dataValues.reduce((stringData, value, idx) => {
            return stringData + "$" + value + ", ";
        }, "");

        const statement = `
            data8 player = { ${data} }
        `.trim();

        const { type, value } = assemblyParser.run(statement).result[0];
        expect(type).equals(ParserTypes.DATA);
        expect(value.size).equals(8);
        expect(value.isExport).equals(false);
        expect(value.name).equals("player");

        let i = 0;
        dataValues.forEach(dataVal => {
            expect(value.values[i].type).equals(ParserTypes.HEX_LITERAL);
            expect(value.values[i++].value).equals(dataVal);
        });
    });

    it("data16", () => {
        const dataValues = ['A6', 'B5AA', '0990', '08'];
        const data = dataValues.reduce((stringData, value, idx) => {
            return stringData + "$" + value + ", ";
        }, "");

        const statement = `
            +data16 rectangle = { ${data} }
        `.trim();

        const { type, value } = assemblyParser.run(statement).result[0];
        expect(type).equals(ParserTypes.DATA);
        expect(value.size).equals(16);
        expect(value.isExport).equals(true);
        expect(value.name).equals("rectangle");

        let i = 0;
        dataValues.forEach(dataVal => {
            expect(value.values[i].type).equals(ParserTypes.HEX_LITERAL);
            expect(value.values[i++].value).equals(dataVal);
        });
    });

    it("structure", () => {
        const statement = `
            structure data {
                x: $4,
                y: $AA,
                w: $2,
                z: $A
            }
        `.trim();
        
        const { type, value } = assemblyParser.run(statement).result[0];
        expect(type).equals(ParserTypes.STRUCTURE);
        expect(value.name).equals("data");

        const expected = {
            "x": '4',
            "y": 'AA',
            "w": '2',
            "z": 'A'
        }

        let i = 0;
        Object.keys(expected).forEach(key => {
            expect(value.members[i].key).equals(key);
            expect(value.members[i].value.type).equals(ParserTypes.HEX_LITERAL);
            expect(value.members[i++].value.value).equals(expected[key]);
        })
    });

    it("constant", () => {
        const { type, value } = assemblyParser.run("constant loc = $00cf").result[0];
        expect(type).equals(ParserTypes.CONSTANT);
        expect(value.isExport).equals(false);
        expect(value.name).equals("loc");
        expect(value.value.type).equals(ParserTypes.HEX_LITERAL);
        expect(value.value.value).equals("00cf");
    })
});