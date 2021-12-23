import Arc, { Parser } from "../parser/arc/index";
import { validLabelIdentifier, hexLiteral, commaSeperated } from "./common";
import { IReturn } from "./instructions/generic";
import { parserTypes } from "./parserTypes";
import { deepLog } from "./util";

const dataParser = (size: number): Parser<IReturn> => Arc.contextual(function* () {
    const isExport = Boolean(yield Arc.possibly(Arc.char('+')));
    yield Arc.str(`data${size}`);

    yield Arc.whitespace;
    const name = yield validLabelIdentifier;
    yield Arc.whitespace;
    yield Arc.char('=');
    yield Arc.whitespace;
    yield Arc.char('{');
    yield Arc.whitespace;

    const values = yield commaSeperated(hexLiteral);
    yield Arc.optionalWhitespace;
    yield Arc.char('}');
    yield Arc.optionalWhitespace;

    return parserTypes.data({
        size,
        isExport,
        name,
        values
    });
})

const data8 = dataParser(8);
const data16 = dataParser(16);

//deepLog(data8.run('+data8 bytes = { $03, $03, $02, $33 }'))

export {
    data8,
    data16
}