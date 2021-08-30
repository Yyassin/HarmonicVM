import { instruction as instructionParser } from "./instructions/instructions";
import Arc from "../parser/arc/index";
import { label } from "./common";

export const assemblyParser = Arc.many(
    Arc.choice([instructionParser, label])
);

assemblyParser.run("MOV R1, R2");

