import { inspect } from "util";

enum ParserTypes {
    REGISTER="REGISTER",
    HEX_LITERAL="HEX_LITERAL",
    VARIABLE="VARIABLE",
    ADDRESS="ADDRESS",

    OP_PLUS="OP_PLUS",
    OP_MINUS="OP_MINUS",
    OP_MULTIPLY="OP_MULTIPLY",

    BINARY_OPERATION="BINARY_OPERATION",
    BRACKETED_EXPRESSION="BRACKETED_EXPRESSION",
    SQUARE_BRACKETED_EXPRESSION="SQUARE_BRACKETED_EXPRESSION",

    LABEL="LABEL",
    INSTRUCTION="INSTRUCTION",

    DATA="DATA",
    CONSTANT="CONSTANT",
    STRUCTURE="STRUCTURE",
    INTERPRET_AS="INTERPRET_AS"
};

const deepLog = x => console.log(inspect(x, {
    depth: Infinity,
    colors: true
}));
const last = arr => arr[arr.length - 1];

// Utility parsers
const asType = (type: ParserTypes) => (value: any) => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(""));
const typifyBracketedExpression = expr => {
    const asBracketed = asType(ParserTypes.BRACKETED_EXPRESSION);
    return asBracketed(expr.map(element => {
        if (Array.isArray(element)) {
            return typifyBracketedExpression(element);
        }
        return element;
    }));
}

export {
    ParserTypes,

    deepLog,
    last,

    asType, 
    mapJoin, 
    typifyBracketedExpression
}