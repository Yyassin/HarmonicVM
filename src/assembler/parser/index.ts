import { instruction } from "./instructions/instructions";
import { deepLog } from "./util";

const res = instruction.run("add [!loc], r1");
deepLog(res);

