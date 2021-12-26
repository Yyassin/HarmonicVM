import { deepLog, mapJoin } from "../util";
import { 
    Err,
    Mutator, 
    NonNull, 
    Ok, 
    ParserState, 
    ParserStateTransformer 
} from "./types";
type Selector<T, E = string> = (result: any) => Parser<T, E>;
type ParserThunk<T, E = string> = () => Parser<T, E>;

/*** ParserState update helpers ***/
/**
 * Updates the specified parser state with a new result and index, if specified.
 * @param state ParserState, the parser state to be updated.
 * @param result NonNull, the parser result.
 * @param index number<Optional>, the new index pertaining to the new state.
 * @returns ParserState, the updated parser state.
 */
const updateParserState = <T>(state: ParserState<T, any>, result: T, index?: number): Ok<T> => (
    index ? { ...state, index, result, isError: false, error: null } : { ...state, result,  isError: false, error: null }
);

/**
 * Updates the specified parser state with the specified error.
 * @param state ParserState, the parser state to be updated.
 * @param errorMsg string, the error message.
 * @returns ParserState, the updated parser state.
 */
const updateParserError = <T, E>(state: ParserState<T, any>, errorMsg: E): Err<E> => ({
    ...state,
    isError: true,
    result: null,
    error: errorMsg
});

/**
 * A parser interface that supports transforming a specified input
 * string subject to the supplied parsing rules in a state transformer.
 */
class Parser<T, E = string> {
    #parserStateTransformer: ParserStateTransformer<T, E>;

    /**
     * Create a new parser.
     * @param parserStateTransformer ParserStateTransformer, function that
     * specifies the rules for parsing the target, accepting a parsing state and 
     * returns the resulting transformed state.
     */
    constructor(parserStateTransformer: ParserStateTransformer<T, E>) {
        this.#parserStateTransformer = parserStateTransformer;
    }

    /**
     * Transform the supplied state subject to the state transformer.
     * @param parserState ParserState, the parser state to transform.
     * @returns ParserState, the transformed parser state.
     */
    parse(parserState: ParserState<any, any>): ParserState<T, E> { 
        return this.#parserStateTransformer(parserState);
    }

    /**
     * Parse the supplied target string subject to the state transformer.
     * @param targetString string, the string to parse.
     * @returns ParserState, the state following the parsing of the supplied string.
     */
    run(targetString: string, strict: boolean = true): ParserState<T, E> {
        const initialState = {
            targetString,
            index: 0,
            result: null,
            isError: false,
            error: null
        }
        
        const finalParsed = this.#parserStateTransformer(initialState);
        if (strict && finalParsed.index != finalParsed.targetString.length) {
                throw new Error(`Syntax error: index ${finalParsed.index}: ` +
                    `${finalParsed.targetString.slice(finalParsed.index, Math.min(finalParsed.index + 15, finalParsed.targetString.length))} ...`);
        }
        return finalParsed;
    }

    //TODO: Solve mapping types
    /**
     * Defines a new parser that maps this parser's result to another
     * subject to the supplied mutator.
     * @param mutator Mutator, function that maps the result of a given state
     * to another.
     * @returns Parser, a wrapped mutator parser.
     */
    map<K>(mutator: Mutator<T, K>): Parser<K, E> {
            // @ts-ignore
        return new Parser(parserState => {
            // @ts-ignore
            const nextState = this.#parserStateTransformer(parserState);

            // Mutate state result if there is no error.
            if (nextState.isError) return nextState;
            // @ts-ignore
            return updateParserState<K>(nextState, mutator(nextState.result));
        });
    }

    /**
     * Defines a new parser using the result of a selector function. The selector
     * accepts the result of another parser and, from it, selects the next parser to apply conditionally.
     * @param selector Selector, function that conditionally returns a parser based on some supplied result.
     * @returns Parser, the next parser.
     */
    chain(selector: Selector<any, any>): Parser<any, any> {
        return new Parser(parserState => {
            const nextState = this.#parserStateTransformer(parserState);

            // Don't chain if there is an error.
            if (nextState.isError) return nextState;

            const nextParser = selector(nextState.result);
            return nextParser.parse(nextState);
        });
    }
}

/**
 * A string lexer. Tokenizes the specified string.
 * @param s string, the string to tokenize.
 * @returns ParserState, the state following parsing completion.
 */
const str = (s: string) => new Parser((parserState: ParserState<string>) => {
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

const char = (c: string): Parser<string> => {
    if (!c || c.length !== 1) {
      throw new TypeError(
        `char must be called with a single character, but got ${c}`,
      );
    }
  
    return new Parser(parserState => {
        if (parserState.isError) return parserState;
  
        const { targetString, index } = parserState;

        if (targetString.length === 0) {
            return updateParserError(
                parserState,
                `ParseError (position ${index}): Expecting character '${c}', but got end of input.`,
                );
        }

        const char = targetString.charAt(index)
        return char === c ? 
            updateParserState(parserState, c, index + 1)
            : 
            updateParserError(
                parserState,
                `ParseError (position ${index}): Expecting character '${c}', got '${char}'`,
            );
    });
};

/*** Parser Combinators ***/
/**
 * Defines a new parser that parses a target subject to the supplied
 * sequence of parsers in the specified order.
 * @param parsers Parser[], an array of parsers to define a parsing sequence 
 * for the new parser.
 * @returns Parser, the sequence parser.
 */
const sequenceOf = (parsers: Parser<any>[]) => new Parser((parserState: ParserState<any[]>) => {
    if (parserState.isError) { return parserState; }

    const results = [] as NonNull[];
    let nextState = parserState;

    // Attempt to match a result from the target
    // with each parser in their supplied order.
    // The parsers themselves are responsible for error propogation.
    for (const p of parsers) {
        nextState = p.parse(nextState);

        if (nextState.isError) { return nextState; }
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
const choice = <T = any>(parsers: Parser<T>[]) => new Parser((parserState: ParserState<T>) => {
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
 * @param assertResult boolean<Optional>, if true, throw an error if no results are matched.
 * @returns Parser, the many parser.
 */
const many = <T>(parser: Parser<T>, assertResult?: boolean) => new Parser((parserState: ParserState<T[]>) => {
    if (parserState.isError) { return parserState; }

    const results = [] as T[];
    let nextState: ParserState<T | T[]> = parserState;

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
        return updateParserError(nextState, `many1: Unable to match any input using parser at index ${nextState.index}.`)
    }

    return updateParserState(nextState, results);
});

/**
 * Defines a new parser from a seperator parser and a value parser. The value parser will be used to 
 * match values that are seperated by string sequences which are themselves matched by the seperator parser.
 * @param seperatorParser Parser, the parser to match the seperation delimeters.
 * @param assertResult boolean<Optional>, if true, throw an error if no results are matched.
 * @returns Parser, the sepBy parser.
 */
const sepBy = <S, T>(seperatorParser: Parser<S>, assertResult?: boolean) => (valueParser: Parser<T>) => new Parser((parserState: ParserState<T>) => {
    const results = [] as T[];
    let nextState: ParserState<S | T | T[]> = parserState;

    while (true) {
        const matchState = valueParser.parse(nextState);
        if (matchState.isError) { break; }

        results.push(matchState.result);
        nextState = matchState;

        const seperatorState = seperatorParser.parse(nextState);
        if (seperatorState.isError) { break; }
        nextState = seperatorState;
    }

    // If a result is asserted and none are matched, return an error.
    if (assertResult && results.length === 0) {
        return updateParserError(nextState, `sepBy1: Unable to match any input using parser at index ${nextState.index}.`)
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
const many1 = <T>(parser: Parser<T>) => many(parser, true);
/**
 * Defines a new parser from a seperator parser and a value parser. The value parser will be used to 
 * match values that are seperated by string sequences which are themselves matched by the seperator parser.
 * Atleast one result must be matched, otherwise an error is thrown.
 * @param seperatorParser Parser, the parser to match the seperation delimeters.
 * @returns Parser, the sepBy parser.
 */
const sepBy1 = <S, T>(seperatorParser: Parser<S>, valueParser: Parser<T>) => sepBy<S,T>(seperatorParser, true)(valueParser);

/**
 * Defines a parser that consists of a left, right and content parser. The
 * content parser will be applied to the target between matches for the left parser
 * and then the right parser.
 * @param leftParser Parser, defines what must be matched left of content.
 * @param rightParser Parser, defines what must be matched right of content.
 * @returns Parser, the between parser.
 */
const between = <L, T, R>(leftParser: Parser<L>, rightParser: Parser<R>) => (contentParser: Parser<T>) => sequenceOf([
    leftParser,
    contentParser,
    rightParser
]).map(results => results[1]);

/*** Lazy support ***/
/**
 * Defines a new parser from a parser thunk to support lazy
 * parser evaluation for recursive parser support.
 * @param parserThunk ParserThunk, a void function that returns a lazily returns a parser.
 * @returns Parser, the lazily loaded parser.
 */
const lazy = <T>(parserThunk: ParserThunk<T>) => new Parser(parserState => {
    const parser = parserThunk();
    return parser.parse(parserState);
})

/*** Condition Assertions ***/
/**
 * Defines a new parser that will update the current state with the 
 * supplied error message to assert a fail case.
 * @param errorMessage string, the error message.
 * @returns Parser, the fail parser.
 */
const fail = <T>(errorMessage: string): Parser<T> => new Parser(parserState => {
    return updateParserError(parserState, errorMessage);
})
  
/**
 * Defines a new parser that will update the current state with the 
 * supplied value to assert a success case
 * @param value any, the value to update the state with.
 * @returns Parser, the success parser.
 */
const success = <T>(value: any): Parser<T> => new Parser(parserState => {
    return updateParserState(parserState, value);
})

const contextual = <T>(generatorFn: () => Generator<Parser<T>, any, any>): Parser<T> => new Parser(parserState => {
    const generator = generatorFn();

    let nextValue = undefined;
    let nextState = parserState;

    while (true) {
        const result = generator.next(nextValue);
        const value = result.value;
        const done = result.done;

        if (done) {
        return updateParserState(nextState, value);
        }

        if (!(value && value instanceof Parser)) {
        throw new Error(
            `[coroutine] yielded values must be Parsers, got ${result.value}.`,
        );
        }

        nextState = value.parse(nextState);
        if (nextState.isError) {
        return nextState;
        }

        nextValue = nextState.result;
    }
});

const possibly = <T>(parser: Parser<T>): Parser<T> => new Parser(parserState => {
    if (parserState.isError) { return parserState; }

    const nextState = parser.parse(parserState);
    return nextState.isError ? (updateParserState(parserState, null)) : nextState;
})

const lookAhead = <T>(parser: Parser<T>): Parser<T> => new Parser(parserState => {
    if (parserState.isError) { return parserState; }

    const nextState = parser.parse(parserState);
    return nextState.isError ?
        updateParserError(parserState, nextState.error)
        :
        updateParserState(parserState, nextState.result)
})

/*** Lexers ***/
const RE_LETTERS = /^[A-Za-z]*/;     // Regex to match letters.
const RE_LETTER = /[a-zA-Z]/;        // Regex to match single letter.
const RE_DIGITS = /^[0-9]*/;         // Regex to match digits.
const RE_DIGIT = /[0-9]*/;           // Regex to match digits.
const RE_WHITESPACES = /^\s+/;       // Regex to match whitepsace.
const RE_ALL = /.+?(?=\n)/;          // Regex to match anything.
const RE_NEW_LINE = /\r?\n/;

/**
 * A letter or digit lexer wrapper, with type being specified.
 * @param parseType LetterDigits, the type to tokenize: letters or digits.
 * @returns ParserState, the state following parsing completion.
 */
const regex = (re: RegExp) => new Parser((parserState: ParserState<string>) => {
    const {
        targetString, 
        index,
        isError
    } = parserState;

    if (isError) return parserState;

    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length === 0) {
        return updateParserError(parserState, `regex: Got unexpected end of input.`)
    }
    
    // Match using type regex
    const regexMatch = slicedTarget.match(re);

    // Matched string will be empty if nothing was matched.
    if (regexMatch && regexMatch[0].length !== 0) {
        return updateParserState(parserState, regexMatch[0], index + regexMatch[0].length);
    }

    return updateParserError(parserState, `regex: Couldnt match digits at index ${index}.`)
})

//***  Generic Lexers ***/
const letters = regex(RE_LETTERS);
const letter = regex(RE_LETTER);
const digits = regex(RE_DIGITS);
const digit = regex(RE_DIGIT);
const whitespace = regex(RE_WHITESPACES);
const comment = char(';')
    .chain(() => mapJoin(sequenceOf([
        optionalWhitespace,
        regex(RE_ALL),
        possibly(regex(RE_NEW_LINE)),
        optionalWhitespace
    ])));
const optionalWhitespace = possibly(whitespace).map(result => result || '');
const optionalComment = possibly(comment).map(result => result || 'comment');

export type { Parser };
export default {
    Parser,
    str,
    char,
    sequenceOf,
    choice,
    between,
    many,
    many1,
    sepBy,
    sepBy1,
    contextual,
    possibly,
    lookAhead,

    regex,
    letters,
    letter,
    digits,
    digit,
    whitespace,
    comment,
    optionalWhitespace,
    optionalComment,

    lazy,
    fail,
    success,

    updateParserState,
    updateParserError
};