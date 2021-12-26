import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";

/**
 * Matches a constant directive: constant index = $C0DE
 */
const constantParser: Parser<IReturn> = Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));    // + indicates an exported member
    yield Arc.str("constant");                                      // Match "constant" followed by label
    yield Arc.whitespace;
    const name = yield validLabelIdentifier;
    yield Arc.whitespace;

    yield Arc.char('=');                                            // Match value
    yield Arc.whitespace;
    const value = yield hexLiteral;
    yield Arc.optionalWhitespace;

    return parserTypes.constant({                                   // Return wrapped node
        isExport,
        name, 
        value
    });
});

export {
    constantParser
};
