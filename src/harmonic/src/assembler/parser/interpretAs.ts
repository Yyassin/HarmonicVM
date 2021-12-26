import Arc from "../parser/arc/index";
import { validLabelIdentifier } from "./common";
import { parserTypes } from "./parserTypes";

/**
 * Matches a data cast <Rectangle> myRectangle.y
 */
const interpretAs = Arc.contextual(function* () {
    yield Arc.char('<');                                    // Match the caster: <Rectangle>
    const structureName = yield validLabelIdentifier;
    yield Arc.char('>');

    yield Arc.optionalWhitespace;                           // Match the castee datum and its member: myRectangle.y
    const symbol = yield validLabelIdentifier;
    yield Arc.char('.');
    const property = yield validLabelIdentifier;
    yield Arc.optionalWhitespace

    return parserTypes.interpretAs({                        // Return the wrapped node.
        structureName,
        symbol,
        property
    });
});

export {
    interpretAs
}
