import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral, commaSeperated } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";

/**
 * Generic data parser: +data16 rectangle = { $A6, $B4, $C9, $DA }
 * Basically an array
 * @param size the element size: bytes (8B) or half words (16B)
 * @returns Parser, the data parser.
 */
const dataParser = (size: number): Parser<IReturn> => Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));        // + indicates an exported member
    yield Arc.str(`data${size}`);                                       // Match data identifier

    yield Arc.whitespace;                                               // Match = open bracket
    const name = yield validLabelIdentifier;
    yield Arc.whitespace;
    yield Arc.char('=');
    yield Arc.whitespace;
    yield Arc.char('{');
    yield Arc.whitespace;

    const values = yield commaSeperated(hexLiteral);                    // Match the data elements and close bracket
    yield Arc.optionalWhitespace;
    yield Arc.char('}');
    yield Arc.optionalWhitespace;

    return parserTypes.data({                                           // Return the wrapped node
        size,
        isExport,
        name,
        values
    });
})

// Data Parser for byte and halfword elements
const data8 = dataParser(8);
const data16 = dataParser(16);

export {
    data8,
    data16
}
