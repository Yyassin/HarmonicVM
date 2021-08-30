type NonNull = {}
interface ParserState<T, E = string> {
    targetString: string,
    index: number,
    result: T,
    isError: boolean,
    error: E,
}
type ParserStateTransformer<T, E = string> = (parserState: ParserState<T, E>) => ParserState<T, E>;
type Mutator<T, K> = (result: T) => K;

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
}