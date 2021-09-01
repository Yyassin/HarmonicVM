import { instruction } from "./instructions/instructions";
import Arc from "../parser/arc/index";
import { label } from "./common";
import { data8, data16 } from "./data";
import { constantParser as constant } from "./constant";
import { structureParser as structure } from "./structure";

export const assemblyParser = Arc.many(
    Arc.choice([
        instruction, 
        label, 
        data8, 
        data16, 
        constant,
        structure
    ])
);

assemblyParser.run("MOV R1, R2");

