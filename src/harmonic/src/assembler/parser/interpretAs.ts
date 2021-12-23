import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral, commaSeperated } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";
import { deepLog, ParserTypes } from "./util";

const interpretAs = Arc.contextual(function* () {
    yield Arc.char('<');
    const structureName = yield validLabelIdentifier;
    yield Arc.char('>');

    yield Arc.optionalWhitespace;
    const symbol = yield validLabelIdentifier;
    yield Arc.char('.');
    const property = yield validLabelIdentifier;
    yield Arc.optionalWhitespace

    return parserTypes.interpretAs({
        structureName,
        symbol,
        property
    });
});

// deepLog(interpretAs.run('<Rectangle> myRectangle.y'));

export {
    interpretAs
}