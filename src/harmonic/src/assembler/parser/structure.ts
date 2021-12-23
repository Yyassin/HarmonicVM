import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral, commaSeperated } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";

const keyValuePair = Arc.contextual(function* () {
    yield Arc.optionalWhitespace;
    const key = yield validLabelIdentifier;

    yield Arc.optionalWhitespace;
    yield Arc.char(':');
    yield Arc.optionalWhitespace;

    const value = yield hexLiteral;
    yield Arc.optionalWhitespace;

    return { key, value };
});

const structureParser: Parser<IReturn> = Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));

    yield Arc.str("structure");
    yield Arc.whitespace;

    const name = yield validLabelIdentifier;
    yield Arc.whitespace;
    yield Arc.char('{');
    yield Arc.whitespace;

    const members = yield commaSeperated(keyValuePair);

    yield Arc.optionalWhitespace;
    yield Arc.char('}');
    yield Arc.optionalWhitespace;

    return parserTypes.structure({
        isExport,
        name,
        members
    });
});

export {
    structureParser
}