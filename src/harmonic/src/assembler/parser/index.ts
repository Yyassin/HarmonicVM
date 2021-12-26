import { instruction } from "./instructions/instructions";
import Arc from "../parser/arc/index";
import { label } from "./common";
import { data8, data16 } from "./data";
import { constantParser as constant } from "./constant";
import { structureParser as structure } from "./structure";

// The harmonic assembly parser.
export const assemblyParser = Arc.many(
    Arc.choice([
        instruction, 
        label, 
        data8, 
        data16, 
        constant,
        structure,
        Arc.comment as any
    ])
);

// For debug
// const statement = `
// ;hello
// mov r1, r2 ; hey
// add $C0DE, r2   ; ilu 
// mov r2, r1 ; ilu2
// `.trim() + '\n';
// assemblyParser.run(statement);
