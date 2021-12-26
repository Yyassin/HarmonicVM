import { inspect } from "util";

// Parser Node Types 
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
type ParseReturn = {
    type: ParserTypes;
    value: any;
};

/**
 * Creates a deeplog of the specified element
 * (used to print all nested levels of an object).
 * @param x any, the item to log.
 */
const deepLog = (x: any) => console.log(inspect(x, {
    depth: Infinity,
    colors: true
}));

/**
 * Returns the last element in the specified array.
 * @param arr, the array.
 */
const last = (arr: any[]) => arr[arr.length - 1];

/*** Utility parsers ***/
/**
 * Maps a nodes value with the specfied type.
 * @param type, the type to associate.
 * @returns ParseReturn, the mapped node.
 */
const asType = (type: ParserTypes) => (value: any): ParseReturn => ({ type, value });

/**
 * Joins the parsed values supplied by the specified parser.
 * @param parser Parser, the parser to match.
 * @returns the joined values.
 */
const mapJoin = parser => parser.map(items => items.join(""));

/**
 * Recursively types the operations in a bracketed expression.
 * @param expr, the expression to typify.
 * @returns ParseReturn, the typified expression node.
 */
const typifyBracketedExpression = (expr: any): ParseReturn => {
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
};
