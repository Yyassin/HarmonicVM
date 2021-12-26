// @ts-nocheck - exporting types is a re-export

type NonNull = {};  // anything but null

// Generic Parser State, transformer (applies a new parser on a given state)
// and mutator (maps state to another)
interface ParserState<T, E = string> {
    targetString: string,
    index: number,
    result: T,
    isError: boolean,
    error: E,
}
type ParserStateTransformer<T, E = string> = (parserState: ParserState<T, E>) => ParserState<T, E>;
type Mutator<T, K> = (result: T) => K;

/* Parser Result Types */
// Err -> Erroneous State, Ok -> Valid State
type ResultType<T, E = string> = Err<E> | Ok<T>;
type Err<E = string> = {
    targetString: string;
    index: number;
    result: null;
    isError: true;
    error: E;
};
type Ok<T> = {
    targetString: string;
    index: number;
    result: T;
    isError: false;
    error: null;
};

export {
    NonNull,
    ParserState, 
    ParserStateTransformer,
    Mutator,
    ResultType,
    Err,
    Ok
};
