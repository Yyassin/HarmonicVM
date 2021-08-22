import * as Arc from "../../../node_modules/arcsecond/index";
import { parserTypes } from "./parserTypes";
import { mapJoin, ParserTypes } from "./util";

const upperOrLowerStr = (s: string) => Arc.choice([
    Arc.str(s.toUpperCase()),
    Arc.str(s.toLowerCase())
]);

const peek = Arc.lookAhead(Arc.regex(/^./));

const register = Arc.choice([
    upperOrLowerStr('r1'),
    upperOrLowerStr('r2'),
    upperOrLowerStr('r3'),
    upperOrLowerStr('r4'),
    upperOrLowerStr('r5'),
    upperOrLowerStr('r6'),
    upperOrLowerStr('r7'),
    upperOrLowerStr('acc'),
    upperOrLowerStr('sp'),
    upperOrLowerStr('fp'),
    upperOrLowerStr('pc')
]).map(parserTypes.register);

const hexDigit = Arc.regex(/^[0-9A-Fa-f]/);

const hexLiteral = Arc.char('$')
    .chain(() => mapJoin(Arc.many1(hexDigit)))
    .map(parserTypes.hexLiteral);

const address = Arc.char('&')
    .chain(() => mapJoin(Arc.many1(hexDigit)))
    .map(parserTypes.address);

const validLabelIdentifier = mapJoin(Arc.sequenceOf([
    Arc.regex(/^[a-zA-Z_]/),
    Arc.possibly(Arc.regex(/^[a-zA-Z0-9_]+/))
       .map(x => x === null ? '' : x)
]));
const variable = Arc.char('!')
    .chain(() => validLabelIdentifier)
    .map(parserTypes.variable);

const operator = Arc.choice([
    Arc.char('+').map(parserTypes.opPlus),
    Arc.char('-').map(parserTypes.opMinus),
    Arc.char('*').map(parserTypes.opMultiply)
]);

interface Expression {
    type: ParserTypes,
    value: any
}
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

    const newExpression = parserTypes.bracketedExpression([
        ...expr.value.slice(0, candidateExpression.leftOpr),
        parserTypes.binaryOperation({
            a: disambiguateOrderOfOperations(expr.value[candidateExpression.leftOpr]),
            b: disambiguateOrderOfOperations(expr.value[candidateExpression.rightOpr]),
            op: candidateExpression.op
        }),
        ...expr.value.slice(candidateExpression.rightOpr + 1)
    ]);

    //deepLog(newExpression);
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
    disambiguateOrderOfOperations
};
