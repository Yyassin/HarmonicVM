type NonNull = {}
interface ParserState {
    targetString: string,
    index: number,
    result: any,
    isError: boolean,
    error: string | null
}
type ParserStateTransformer = (parserState: ParserState) => ParserState;
type Mutator = (result: any) => any;
type ErrorMutator = (error: NonNull, index: number) => any;

export {
    NonNull,
    ParserState, 
    ParserStateTransformer,
    Mutator,
    ErrorMutator
}