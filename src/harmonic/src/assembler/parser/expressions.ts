import Arc, { Parser } from "../parser/arc/index";
import { disambiguateOrderOfOperations, hexLiteral, operator, peek, variable } from "./common";
import { parserTypes } from "./parserTypes";
import { last, typifyBracketedExpression } from "./util";
import { interpretAs } from "./interpretAs";

const expressionElement = Arc.choice([
    hexLiteral,
    variable,
    interpretAs
])
//TODO: solve the type error
// @ts-ignore
const bracketedExpr = Arc.contextual(function* () {
    enum states {
        OPEN_BRACKET=0,
        OPERATOR_OR_CLOSING_BRACKET=1,
        ELEMENT_OR_OPENING_BRACKET=2,
        CLOSE_BRACKET=3
    };
    const expr = [] as (string | number | (string | number)[])[];
    const stack = [expr];
    yield Arc.char('(');

    let state = states.ELEMENT_OR_OPENING_BRACKET;

    let flag = true;
    while (flag) {
        const nextChar: string = yield peek;

        switch(state) {
            case states.OPEN_BRACKET: {
                yield Arc.char('(');
                expr.push([]);
                stack.push(last(expr));
                yield Arc.optionalWhitespace;
                state = states.ELEMENT_OR_OPENING_BRACKET;
                continue;
            }

            case states.OPERATOR_OR_CLOSING_BRACKET: {
                if (nextChar === ')') {
                    state = states.CLOSE_BRACKET;
                    continue;
                }

                last(stack).push(yield operator);
                yield Arc.optionalWhitespace;
                state = states.ELEMENT_OR_OPENING_BRACKET;
                continue;
            }
            
            case states.ELEMENT_OR_OPENING_BRACKET: {
                if (nextChar === ')') {
                    yield Arc.fail<string>("Unexpected end of expression");
                    break;
                }

                if (nextChar === "(") {
                    state = states.OPEN_BRACKET;
                } else {
                    // MOV LIT REG so no register
                    last(stack).push(yield expressionElement);
                    yield Arc.optionalWhitespace;
                    state = states.OPERATOR_OR_CLOSING_BRACKET;
                }
                continue;
            }

            case states.CLOSE_BRACKET: {
                yield Arc.char(')');
                stack.pop();
                if (stack.length === 0) {
                    flag = false;
                    break;
                }

                yield Arc.optionalWhitespace;
                state = states.OPERATOR_OR_CLOSING_BRACKET;
                continue;
            }

            default:
                throw new Error("Reached undefined state in parse finite state machine: 'Bracketed Expression'");
        }
    }

    return typifyBracketedExpression(expr);
});

const squareBracketExpr = Arc.contextual(function* () {
    enum states {
        EXPECT_ELEMENT=0,
        EXPECT_OPERATOR=1
    };
    let state = states.EXPECT_ELEMENT;

    yield Arc.char('[');
    yield Arc.optionalWhitespace;

    const expr = [] as (string | number)[];

    let flag = true;
    while (flag) {
        switch(state) {
            case states.EXPECT_ELEMENT: {
                const result = yield Arc.choice([
                    bracketedExpr,
                    expressionElement
                ]);
                expr.push(result);
                state = states.EXPECT_OPERATOR;
                yield Arc.optionalWhitespace;
                continue;
            }

            case states.EXPECT_OPERATOR: {
                const nextChar: string = yield peek;
                if (nextChar === ']') {
                    yield Arc.char(']');
                    yield Arc.optionalWhitespace;
                    flag = false;
                    break;
                }
                
                const result = yield operator;
                expr.push(result);
                state = states.EXPECT_ELEMENT;
                yield Arc.optionalWhitespace;
                continue;
            }

            default:
                throw new Error("Reached undefined state in parse finite state machine: 'Square Bracket Expression'");
        }
    }

    return parserTypes.squareBracketedExpression(expr);
}).map(disambiguateOrderOfOperations);

export {
    squareBracketExpr,
    bracketedExpr
}
