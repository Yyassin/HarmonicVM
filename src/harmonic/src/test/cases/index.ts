import { tests as movTests } from "./mov";
import { tests as addTests } from "./add";
import { tests as subTests } from "./sub";
import { tests as andTests } from "./and";
import { tests as orTests } from "./or";
import { tests as xorTests } from "./xor";
import { tests as mulTests } from "./mul";
import { tests as lslTests } from "./lsl";
import { tests as lsrTests } from "./lsr";

import { tests as notTests } from "./not";
import { tests as incTests } from "./inc";
import { tests as decTests } from "./dec";

import { tests as jumpTests } from "./jumps";
import { tests as stackTests } from "./stack";



export { movTests, stackTests };
export const instructions = {
    "add": addTests,
    "sub": subTests,
    "mul": mulTests,
    "and": andTests,
    "or" : orTests,
    "xor": xorTests,
    "lsl": lslTests,
    "lsr": lsrTests,
    
    "inc": incTests,
    "dec": decTests,
    "not": notTests,

    "jump": jumpTests,
}