import { asType, ParserTypes } from "./util";

// ParserTypes: wrap and tokenize a node with the appropriate type label for parsing.
export const parserTypes = {
    register:                   asType(ParserTypes.REGISTER),
    hexLiteral:                 asType(ParserTypes.HEX_LITERAL),
    variable:                   asType(ParserTypes.VARIABLE),
    address:                    asType(ParserTypes.ADDRESS),

    opPlus:                     asType(ParserTypes.OP_PLUS),
    opMinus:                    asType(ParserTypes.OP_MINUS),
    opMultiply:                 asType(ParserTypes.OP_MULTIPLY),

    binaryOperation:            asType(ParserTypes.BINARY_OPERATION),
    bracketedExpression:        asType(ParserTypes.BRACKETED_EXPRESSION),
    squareBracketedExpression:  asType(ParserTypes.SQUARE_BRACKETED_EXPRESSION),

    label:                      asType(ParserTypes.LABEL),                            
    instruction:                asType(ParserTypes.INSTRUCTION),

    data:                       asType(ParserTypes.DATA),
    constant:                   asType(ParserTypes.CONSTANT),
    structure:                  asType(ParserTypes.STRUCTURE),
    interpretAs:                asType(ParserTypes.INTERPRET_AS)
};
