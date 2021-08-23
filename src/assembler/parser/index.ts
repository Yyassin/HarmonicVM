import { instruction as instructionParser } from "./instructions/instructions";
import * as Arc from "../../../node_modules/arcsecond/index";
import { label } from "./common";

export const assemblyParser = Arc.many(
    Arc.choice([instructionParser, label])
);

