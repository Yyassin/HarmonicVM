import { ErrorMutator, Mutator, NonNull, ParserState, ParserStateTransformer } from "./types";

/*** ParserState update helpers ***/
/**
 * Updates the specified parser state with a new result and index, if specified.
 * @param state ParserState, the parser state to be updated.
 * @param result NonNull, the parser result.
 * @param index number<Optional>, the new index pertaining to the new state.
 * @returns ParserState, the updated parser state.
 */
const updateParserState = (state: ParserState, result: NonNull, index?: number): ParserState => (
    index ? { ...state, index, result } : { ...state, result }
);

/**
 * Updates the specified parser state with the specified error.
 * @param state ParserState, the parser state to be updated.
 * @param errorMsg string, the error message.
 * @returns ParserState, the updated parser state.
 */
const updateParserError = (state: ParserState, errorMsg: string): ParserState => ({
    ...state,
    isError: true,
    error: errorMsg
});

/**
 * A parser interface that supports transforming a specified input
 * string subject to the supplied parsing rules in a state transformer.
 */
class Parser {
    #parserStateTransformer: ParserStateTransformer;

    /**
     * Create a new parser.
     * @param parserStateTransformer ParserStateTransformer, function that
     * specifies the rules for parsing the target, accepting a parsing state and 
     * returns the resulting transformed state.
     */
    constructor(parserStateTransformer: ParserStateTransformer) {
        this.#parserStateTransformer = parserStateTransformer;
    }

    /**
     * Transform the supplied state subject to the state transformer.
     * @param parserState ParserState, the parser state to transform.
     * @returns ParserState, the transformed parser state.
     */
    parse(parserState: ParserState): ParserState { 
        return this.#parserStateTransformer(parserState);
    }

    /**
     * Parse the supplied target string subject to the state transformer.
     * @param targetString string, the string to parse.
     * @returns ParserState, the state following the parsing of the supplied string.
     */
    run(targetString: string): ParserState {
        const initialState = {
            targetString,
            index: 0,
            result: null,
            isError: false,
            error: null
        }
    
        return this.#parserStateTransformer(initialState);
    }

    /**
     * Defines a new parser that maps this parser's result to another
     * subject to the supplied mutator.
     * @param mutator Mutator, function that maps the result of a given state
     * to another.
     * @returns Parser, a wrapped mutator parser.
     */
    map(mutator: Mutator): Parser {
        return new Parser(parserState => {
            const nextState = this.#parserStateTransformer(parserState);

            // Mutate state result if there is no error.
            if (nextState.isError) return nextState;
            return updateParserState(nextState, mutator(nextState.result));
        });
    }

    /**
     * Defines a new parser that maps this parser's error to another
     * subject to the supplied error mutator.
     * @param mutator ErrorMutator, function that maps the error and index of a given state
     * to another error.
     * @returns Parser, a wrapped mutator parser.
     */
    errorMap(mutator: ErrorMutator) {
        return new Parser(parserState => {
            const nextState = this.#parserStateTransformer(parserState);

            // Mutate state error if it exists
            if (!nextState.isError) return nextState;
            return updateParserError(nextState, mutator(nextState.error, nextState.index));
        });
    }
}

/**
 * A string tokenizer. Tokenizes the specified string.
 * @param s string, the string to tokenize.
 * @returns ParserState, the state following parsing completion.
 */
const str = (s: string) => new Parser((parserState: ParserState) => {
    const { targetString, index, isError } = parserState;
    
    // Propogate the error if there is one.
    if (isError) { return parserState; }

    // Slice the target to the current index
    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length === 0) {
        return updateParserError(parserState, `str: Tried to match "${s}" but got unexpected end of input.`)
    }

    // Check that our search string is next in the target
    if (slicedTarget.startsWith(s)){
        // Success
        return updateParserState(parserState, s, index + s.length);
    }

    return updateParserError(parserState, `str: Tried to match ${s} but got ${targetString.slice(index, index + 10)}...`);
});

enum LetterDigits {
    LETTERS="letters",
    DIGITS="digits"
}
const LETTERS_REGEX = /^[A-Za-z]*/;     // Regex to match letters.
const DIGITS_REGEX = /^[0-9]*/;         // Regex to match digits.
/**
 * A letter or digit tokenizer wrapper, with type being specified.
 * @param parseType LetterDigits, the type to tokenize: letters or digits.
 * @returns ParserState, the state following parsing completion.
 */
const letterOrDigits = (parseType: LetterDigits) => new Parser((parserState: ParserState) => {
    const {
        targetString, 
        index,
        isError
    } = parserState;

    if (isError) return parserState;

    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length === 0) {
        return updateParserError(parserState, `${parseType}: Got unexpected end of input.`)
    }
    
    // Match using type regex
    const regex = (parseType === LetterDigits.DIGITS) ? DIGITS_REGEX : LETTERS_REGEX;
    const regexMatch = slicedTarget.match(regex);
    const matchedString = regexMatch[0];

    // Matched string will be empty if nothing was matched.
    if (matchedString.length !== 0) {
        return updateParserState(parserState, matchedString, index + matchedString.length);
    }

    return updateParserError(parserState, `${parseType}: Couldnt match digits at index ${index}.`)
})

//***  Generic Tokenizers ***/
// Tokenize letters.
const letters = letterOrDigits(LetterDigits.LETTERS);
// Tokenize Digits.
const digits = letterOrDigits(LetterDigits.DIGITS);

/*** Parser Combinators ***/
/**
 * Defines a new parser that parses a target subject to the supplied
 * sequence of parsers in the specified order.
 * @param parsers Parser[], an array of parsers to define a parsing sequence 
 * for the new parser.
 * @returns Parser, the sequence parser.
 */
const sequenceOf = (parsers: Parser[]) => new Parser((parserState: ParserState) => {
    if (parserState.isError) { return parserState; }

    const results = [] as NonNull[];
    let nextState = parserState;

    // Attempt to match a result from the target
    // with each parser in their supplied order.
    // The parsers themselves are responsible for error propogation.
    for (const p of parsers) {
        nextState = p.parse(nextState);
        results.push(nextState.result);
    }

    return updateParserState(nextState, results);
})

/**
 * Defines a new parser that parses a target with a choice of parses, returning
 * the first successful result of the supplied parser choices.
 * The parser choices are applied in the order they are supplied.
 * @param parsers Parser[], an array of parsers to serve as choices to parse a target.
 * @returns Parser, the choice parser.
 */
const choice = (parsers: Parser[]) => new Parser((parserState: ParserState) => {
    if (parserState.isError) { return parserState; }

    // Attempt to match a result in the target string
    // with the supplied parser in their given order,
    // return the first success.
    for (const p of parsers) {
        const nextState = p.parse(parserState);
        if(!nextState.isError) { return nextState; }
    }

    // Couldn't match with any supplied parser.
    return updateParserError(parserState, `choice: Unabled to match with any choice parser at index ${parserState.index}.`);
})

/**
 * Defines a new parser that attempts to parse a target with
 * the supplied parser as many times as possible.
 * @param parser Parser, the parser to parse against.
 * @returns Parser, the many parser.
 */
const many = (parser: Parser, assertResult?: boolean) => new Parser((parserState: ParserState) => {
    if (parserState.isError) { return parserState; }

    const results = [] as NonNull[];
    let nextState = parserState;

    // Attempt to match result in the given string
    // with the supplied parser until an error is encountered.
    while (true) {
        const testState = parser.parse(nextState);
        
        if (!testState.isError) {
            results.push(testState.result);
            nextState = testState;
        } else {
            break;
        }
    }

    // If a result is asserted and none are matched, return an error.
    if (assertResult && results.length === 0) {
        return updateParserError(nextState, `many1: Unable to match any input using parser at index ${parserState.index}.`)
    }

    return updateParserState(nextState, results);

})

/**
 * Defines a new parser that attempts to parse a target with
 * the supplied parser as many times as possible. Atleast one result
 * must be matched, otherwise an error is thrown.
 * @param parser Parser, the parser to parse against.
 * @returns Parser, the many parser.
 */
const many1 = (parser: Parser) => many(parser, true);

// Testing
const parser = many1(
    choice([
        digits
    ])
)

console.log(
    parser.run("asd")
)

export {
    str,
    letters,
    digits,
    sequenceOf,
    choice,
    many,
    many1
}