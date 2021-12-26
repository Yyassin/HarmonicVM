import Arc from "../parser/arc/index";
import { disambiguateOrderOfOperations, hexLiteral, operator, peek, variable } from "./common";
import { parserTypes } from "./parserTypes";
import { last, typifyBracketedExpression } from "./util";
import { interpretAs } from "./interpretAs";

// Expression elements: literal $AB, variable [!loc] or interpreted datum <Rectangle> myRect.y
const expressionElement = Arc.choice([
    hexLiteral,
    variable,
    interpretAs
])

//TODO: solve the type error
/**
 * Matches a nested bracketed expression i.e (1 + (2 * 4))
 * via state machine.
 */
// @ts-ignore
const bracketedExpr = Arc.contextual(function* () {
    enum states {
        OPEN_BRACKET=0,                                             // Match open bracket next
        OPERATOR_OR_CLOSING_BRACKET=1,                              // Match operator or close bracket next
        ELEMENT_OR_OPENING_BRACKET=2,                               // Match expr element or open bracket next
        CLOSE_BRACKET=3                                             // Match close bracket next
    };
    const expr = [] as (string | number | (string | number)[])[];   // Holds our expressions
    const stack = [expr];                                           // Holds the last expression so we can 
                                                                    // always modify the latest one
    yield Arc.char('(');

    let state = states.ELEMENT_OR_OPENING_BRACKET;                  

    let flag = true;
    while (flag) {
        const nextChar: string = yield peek;

        switch(state) {
            case states.OPEN_BRACKET: {                         // Match an open bracket
                yield Arc.char('(');
                expr.push([]);                                  // Indicates a new expression, push it
                stack.push(last(expr));
                yield Arc.optionalWhitespace;
                state = states.ELEMENT_OR_OPENING_BRACKET;
                continue;
            }

            case states.OPERATOR_OR_CLOSING_BRACKET: {          // Either match the next op or close expression.
                if (nextChar === ')') {                         // If next is close bracket, head to close bracket state
                    state = states.CLOSE_BRACKET;
                    continue;
                }

                last(stack).push(yield operator);               // Otherwise push the current operator into our current expression
                yield Arc.optionalWhitespace;
                state = states.ELEMENT_OR_OPENING_BRACKET;
                continue;
            }
            
            case states.ELEMENT_OR_OPENING_BRACKET: {           // Match the next element or open bracket
                if (nextChar === ')') {                         // We're not expecting a ) after an open bracket/ operator, error.
                    yield Arc.fail<string>("Unexpected end of expression");
                    break;
                }

                if (nextChar === "(") {                         // If new bracket, head to open bracket state
                    state = states.OPEN_BRACKET;
                } else {
                    // MOV LIT REG so no register
                    last(stack).push(yield expressionElement);  // Otherwise, new value push to current expression
                    yield Arc.optionalWhitespace;
                    state = states.OPERATOR_OR_CLOSING_BRACKET;
                }
                continue;
            }

            case states.CLOSE_BRACKET: {                        // Match a close bracket
                yield Arc.char(')');
                stack.pop();                                    // Indicates end of expression, pop it
                if (stack.length === 0) {                       // Done if no more expressions
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

    // Typify each expression
    return typifyBracketedExpression(expr);
});


/**
 * Matches a nested square bracketed expression i.e [1 + [2 * 4]]
 * via state machine.
 */
const squareBracketExpr = Arc.contextual(function* () {
    enum states {
        EXPECT_ELEMENT=0,
        EXPECT_OPERATOR=1
    };
    let state = states.EXPECT_ELEMENT;

    yield Arc.char('[');
    yield Arc.optionalWhitespace;

    const expr = [] as (string | number)[];     // Stores the expression elements

    let flag = true;
    while (flag) {
        switch(state) { 
            case states.EXPECT_ELEMENT: {               // Matches an element -> either a bracket expression
                                                        // or an expression element.
                const result = yield Arc.choice([
                    bracketedExpr,
                    expressionElement
                ]);
                expr.push(result);  
                state = states.EXPECT_OPERATOR;         // Now we need an operator
                yield Arc.optionalWhitespace;
                continue;
            }

            case states.EXPECT_OPERATOR: {              // Matches operator or end of expression
                const nextChar: string = yield peek;
                if (nextChar === ']') {                 // Matched end
                    yield Arc.char(']');
                    yield Arc.optionalWhitespace;
                    flag = false;
                    break;
                }
                
                const result = yield operator;          // Matched operator, add it then expect another element
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
}).map(disambiguateOrderOfOperations);  // Disambiguate the order of operations within the expression

export {
    squareBracketExpr,
    bracketedExpr
}
