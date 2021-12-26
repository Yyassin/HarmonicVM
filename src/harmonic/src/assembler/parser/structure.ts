import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral, commaSeperated } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";

/**
 * Matches a key and value pair x : $45
 */
const keyValuePair = Arc.contextual(function* () {
    yield Arc.optionalWhitespace;                   // Match key
    const key = yield validLabelIdentifier;

    yield Arc.optionalWhitespace;                   // Match colon
    yield Arc.char(':');
    yield Arc.optionalWhitespace;

    const value = yield hexLiteral;                 // Match value
    yield Arc.optionalWhitespace;

    return { key, value };
});

/**
 * Matches a structure of the form: structure data {
                                            x: $4,
                                            y: $AA,
                                            w: $2,
                                            z: $A
                                        }
 */
const structureParser: Parser<IReturn> = Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));            // + indicates exported member

    yield Arc.str("structure");                                             // Match structure keyword and label {
    yield Arc.whitespace;

    const name = yield validLabelIdentifier;                                
    yield Arc.whitespace;
    yield Arc.char('{');
    yield Arc.whitespace;

    const members = yield commaSeperated(keyValuePair);                     // Match key value pairs }

    yield Arc.optionalWhitespace;
    yield Arc.char('}');
    yield Arc.optionalWhitespace;

    return parserTypes.structure({                                          // Return the wrapped node
        isExport,
        name,
        members
    });
});

export {
    structureParser
}
