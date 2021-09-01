import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";
import { deepLog } from "./util";

const constantParser: Parser<IReturn> = Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));
    yield Arc.str("constant");
    yield Arc.whitespace;
    const name = yield validLabelIdentifier;
    yield Arc.whitespace;
    yield Arc.char('=');
    yield Arc.whitespace;
    const value = yield hexLiteral;
    yield Arc.optionalWhitespace;

    return parserTypes.constant({
        isExport,
        name, 
        value
    });
})

// deepLog(constantParser.run('constant code_constant = $C0DE'))

export {
    constantParser
}