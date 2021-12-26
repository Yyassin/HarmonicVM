import registers from "../../cpu/registers";
import Arc, { Parser } from "../parser/arc/index";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";
import { mapJoin, ParserTypes } from "./util";

/*** Various common parsers ***/

/**
 * Matches the specified string in fully upper or
 * lower case (used for mnemonics).
 * @param s string, the string to match.
 * @returns Parser, the parser.
 */
const upperOrLowerStr = (s: string): Parser<string, string> => Arc.choice([
    Arc.str(s.toUpperCase()),
    Arc.str(s.toLowerCase())
]);

/**
 * Matches the next character without consuming the input.
 */
const peek: Parser<string, string> = Arc.lookAhead<string>(Arc.regex(/^./));

/**
 * Matches a register label.
 */
const register: Parser<{ type: ParserTypes; value: any;}, string> = 
    Arc.choice(registers.map(registerLabel => upperOrLowerStr(registerLabel)))
       .map(parserTypes.register);

/**
 * Matches a hexadecimal digit.
 */
const hexDigit: Parser<string, string> = Arc.regex(/^[0-9A-Fa-f]/);

/**
 * Matches a hexadecimal literal : $ABCD.
 */
const hexLiteral: Parser<{ type: ParserTypes; value: any;}, string> = 
    Arc.char('$')
       .chain(() => mapJoin(Arc.many1(hexDigit)))
       .map(parserTypes.hexLiteral);

/**
 * Matches a memory address : &ABCD.
 */
const address: Parser<{ type: ParserTypes; value: any;}, string> = 
    Arc.char('&')
       .chain(() => mapJoin(Arc.many1(hexDigit)))
       .map(parserTypes.address);

/**
 * Matches a valid label.
 */
const validLabelIdentifier = mapJoin(Arc.sequenceOf([
    Arc.regex(/^[a-zA-Z_]/),
    Arc.possibly(Arc.regex(/^[a-zA-Z0-9_]+/))
       .map(x => x === null ? '' : x)
]));

/**
 * Matches a variable label : !loc
 */
const variable = Arc.str('!')
    .chain(() => validLabelIdentifier)
    .map(parserTypes.variable);

/**
 * Matches a valid arithmetic operator for binary expressions : +, - and *.
 */
const operator = Arc.choice([
    Arc.char('+').map(parserTypes.opPlus),
    Arc.char('-').map(parserTypes.opMinus),
    Arc.char('*').map(parserTypes.opMultiply)
]);

/**
 * Matches a code section label - start:
 */
const label: Parser<IReturn> = Arc.sequenceOf([
    validLabelIdentifier,
    Arc.char(':'),
    Arc.optionalWhitespace
])
.map(([labelName]) => labelName)
.map(parserTypes.label);

const optionalWhitespaceSurrounded = Arc.between(Arc.optionalWhitespace, Arc.optionalWhitespace);   // Match item optionally surrounded by whitespace
const commaSeperated = Arc.sepBy(optionalWhitespaceSurrounded(Arc.char(',')));                      // Match comma seperated items

export interface Expression {
    type: ParserTypes,
    value: any
};

/**
 * Disambiguates the order of operations for the given binary
 * expressions such that bedmas is preservered.
 * @param expr The epxression to disambiguate.
 * @returns The disambiguated expression
 */
const disambiguateOrderOfOperations = (expr: Expression) => {
    if (expr.type !== ParserTypes.SQUARE_BRACKETED_EXPRESSION 
        && expr.type !== ParserTypes.BRACKETED_EXPRESSION) {
        return expr;
    }

    // value is array
    if (expr.value.length === 1) {
        return expr.value[0];
    }

    const operationPriorities = {
        OP_MULTIPLY: 2,
        OP_PLUS: 1,
        OP_MINUS: 0
    };

    let candidateExpression = {
        priority: -Infinity,
        leftOpr: null,
        rightOpr: null,
        op: null
    }

    // Loop over operators
    for (let i = 1; i < expr.value.length; i+=2) {
        const level = operationPriorities[expr.value[i].type];
        if (level > candidateExpression.priority) {
            candidateExpression = {
                priority: level,
                leftOpr: i - 1,
                rightOpr: i + 1,
                op: expr.value[i]
            }
        }
    }

    // Recursively disambiguate each operation by comparing it with the one to its left and the one to its right
    // until we've run out of bracketed expressions.
    const newExpression = parserTypes.bracketedExpression([
        ...expr.value.slice(0, candidateExpression.leftOpr),
        parserTypes.binaryOperation({
            a: disambiguateOrderOfOperations(expr.value[candidateExpression.leftOpr]),
            b: disambiguateOrderOfOperations(expr.value[candidateExpression.rightOpr]),
            op: candidateExpression.op
        }),
        ...expr.value.slice(candidateExpression.rightOpr + 1)
    ]);

    return disambiguateOrderOfOperations(newExpression);
}

export {
    upperOrLowerStr,
    peek,
    register,
    hexDigit,
    hexLiteral,
    address,
    validLabelIdentifier,
    variable,
    operator,
    label,
    disambiguateOrderOfOperations,
    commaSeperated
};
