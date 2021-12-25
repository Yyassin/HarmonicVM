import { expect } from "chai";
import CPU from "../cpu/CPU";
import { init } from "../../index";
import { instruction } from "../assembler/parser/instructions/instructions";
import registers from "../cpu/registers";
import { assemble } from "../assembler/index";
import { instructions } from "./cases/index";
import { deepLog } from "../assembler/parser/util";
import { write } from "fs";

let cpu: CPU;
let writableBytes: Uint8Array;

const run = (script: string, pointer = 0) => {
    const { assembled, parsedInstructions } = assemble(script);
    //console.log(parsedInstructions);
    for (let i = 0; assembled && i < assembled.length; i++) {
        writableBytes[pointer + i] = assembled[i];
    } 
    cpu.setRegister("pc", 0);
}

const makeSuite = (name, tests) => {
    describe(name, () => {
        beforeEach(() => {
            const vm = init();
            cpu = vm.cpu;
            writableBytes= vm.writableBytes;
    
            registers.filter(label => label[0] == "r")
                     .forEach(label => {
                cpu.setRegister(label, parseInt(label[1]))
            });
        });
        tests();
    });
}

makeSuite("mov_impl", () => {
    it("mov_reg_reg", () => {
        run("mov r2, r1");

        cpu.cycle();
        expect(cpu.getRegister("r1")).equals(2);
        expect(cpu.getRegister("r2")).equals(2);
    });

    it("mov_lit_reg", () => {
        run("mov $4055, r2");

        cpu.cycle();
        expect(cpu.getRegister("r2")).equals(0x4055);
    });

    it("mov_lit_reg variable", () => {
        run(`
            constant loc = $000c
            mov [!loc], r2
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("r2")).equals(0x000C);
    });

    it("mov_lit_mem", () => {
        run("mov $55, &777");

        cpu.cycle();
        expect(cpu.viewMemoryAt(0x777, 2, false)).equals(0x55);
    });

    it("mov_reg_mem", () => {
        run("mov r4, &777");

        cpu.cycle();
        expect(cpu.viewMemoryAt(0x777, 2, false)).equals(4);
    });

    it("mov_mem_reg", () => {
        run(`
            mov $55, &777
            mov &777, r4
        `.trim());

        cpu.cycle();
        expect(cpu.viewMemoryAt(0x777, 2, false)).equals(0x55);
        cpu.cycle();
        expect(cpu.getRegister("r4")).equals(0x55);
    });

    // Loads the address that r6 points to in r7
    it("mov_reg_ind_reg", () => {
        run(`
            mov $8, &100
            mov $100, r6
            mov &r6, r7
        `.trim());

        cpu.cycle();
        expect(cpu.viewMemoryAt(0x100, 2, false)).equals(0x8);
        cpu.cycle();
        expect(cpu.getRegister("r6")).equals(0x100);
        cpu.cycle();
        expect(cpu.getRegister("r7")).equals(0x8);
    });

    // Sets r5 <- Memory[r5 + 45] so Memory[4A]
    it("mov_lit_off_reg", () => {
        run(`
            mov $90, &4A
            mov $45, &r5, r5
        `.trim());

        cpu.cycle();
        expect(cpu.viewMemoryAt(0x4A, 2, false)).equals(0x90);
        cpu.cycle();
        expect(cpu.getRegister("r5")).equals(0x90);
    });
});

const inPlace = ["dec", "inc", "lsl", "lsr"];
Object.keys(instructions).filter(name => !inPlace.includes(name) && name != "jump").map(name => {
    makeSuite(name + "_impl", () => {
        const tests = instructions[name];
        tests.forEach(({ name, statement, expected }) => {
            it(name, () => {
                run(statement);
                cpu.cycle();
                
                expect(cpu.getRegister("acc")).equals(expected.outcome);
            });
        });
    });
});

inPlace.map(name => {
    makeSuite(name + "_impl", () => {
        const tests = instructions[name];
        tests.forEach(({ name, statement, expected }) => {
            it(name, () => {
                run(statement);
                const result = instruction.run(statement)
                const register = result.result.value.args[0].value;
                //deepLog(register);

                cpu.cycle();
                expect(cpu.getRegister(register)).equals(expected.outcome);
            });
        });
    });
})

makeSuite("jump_impl", () => {
    it("jeq_reg", () => {
        run(`
            add r1, r1     
            jeq r1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        // No jump since 2 doesn't equal 1 (r1)
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jeq r2, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 2 is 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jeq_lit", () => {
        run(`
            add r1, r1     
            jeq $1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        // No jump since 2 doesn't equal 1
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jeq $2, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 2 is 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jne_reg", () => {
        run(`
            add r1, r1     
            jne r2, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        // No jump since 2 equals 2
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jne r1, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 1 is not 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jne_lit", () => {
        run(`
            add r1, r1     
            jne $2, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        // No jump since 2 equals 2
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jne $1, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 1 is not 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jlt_reg", () => {
        run(`
            add r1, r1     
            jlt r3, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jlt r1, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jlt_lit", () => {
        run(`
            add r1, r1     
            jlt $3, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jlt $1, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jgt_reg", () => {
        run(`
            add r1, r1     
            jgt r1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jgt r3, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 1 is not 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jgt_lit", () => {
        run(`
            add r1, r1     
            jgt $1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jgt $3, &C0DE
        `.trim());

        cpu.cycle();
        // Jump since 1 is not 2 (r2)
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jle_reg", () => {
        run(`
            add r1, r1     
            jle r3, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jle r1, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch

        run(`
            jle r2, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jle_lit", () => {
        run(`
            add r1, r1     
            jle $3, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jle $1, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch

        run(`
            jle $2, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jge_reg", () => {
        run(`
            add r1, r1     
            jge r1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // reg mem 4
        expect(cpu.getRegister("pc")).equals(7);

        run(`
            jge r3, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch

        run(`
            jge r2, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });

    it("jge_lit", () => {
        run(`
            add r1, r1     
            jge $1, &C0DE
        `.trim());

        cpu.cycle(); // reg reg 3
        cpu.cycle(); // lit mem 5
        expect(cpu.getRegister("pc")).equals(8);

        run(`
            jge $3, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch

        run(`
            jge $2, &C0DE
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0xc0de); // branch
    });
});

makeSuite("stack_impl", () => {
    it("push_pop", () => {
        run(`
            psh r4
            psh $1
            psh r6
            pop r1
            pop r2
            pop r3
        `.trim());

        let previousSp = cpu.getRegister("sp");

        cpu.cycle();
        expect(cpu.getRegister("sp")).equals(previousSp - 2); 
        expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(4); previousSp = cpu.getRegister("sp");

        cpu.cycle();
        expect(cpu.getRegister("sp")).equals(previousSp - 2); 
        expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(1); previousSp = cpu.getRegister("sp");

        cpu.cycle();
        expect(cpu.getRegister("sp")).equals(previousSp - 2); 
        expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(6); previousSp = cpu.getRegister("sp");

        cpu.cycle();
        cpu.cycle();
        cpu.cycle();
        
        expect(cpu.getRegister("r1")).equals(6);      
        expect(cpu.getRegister("r2")).equals(1);        
        expect(cpu.getRegister("r3")).equals(4);        
    });

    it("cal_reg", () => {
        run(`
            mov $100, r7
            cal r7
        `.trim());

        cpu.cycle();
        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0x100);
    });

    it("cal_lit", () => {
        run(`
            cal $100
        `.trim());

        cpu.cycle();
        expect(cpu.getRegister("pc")).equals(0x100);
    });

    it("halt", () => {
        run(`
            add r1, r1
            hlt
        `.trim());

        cpu.run();
        expect(cpu.getRegister("pc")).equals(3); // halted
    });

    it("ret", () => {
        run(`
            constant subroutine = $3000
            psh $3333
            psh $2222

            mov $1234, r1
            mov $5151, r4

            psh $0
            cal [!subroutine]
        `.trim());
        
        run(`
            psh $102
            psh $304
            psh $0506

            mov $0708, r1
            mov $090A, r4

            ret
        `.trim(), 0x3000);

        let previousSp = cpu.getRegister("sp");

        // First we push two values to the stack
        [0x3333, 0x2222].forEach(value => {
            cpu.cycle();
            expect(cpu.getRegister("sp")).equals(previousSp - 2); 
            expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(value); previousSp = cpu.getRegister("sp");
        });

        // Then we modify the values of two registers
        cpu.cycle(); expect(cpu.getRegister("r1")).equals(0x1234);
        cpu.cycle(); expect(cpu.getRegister("r4")).equals(0x5151);

        // Now we push a 0 (0 arguments made to the subroutine)
        cpu.cycle();
        expect(cpu.getRegister("sp")).equals(previousSp - 2); 
        expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(0x0); previousSp = cpu.getRegister("sp");

        const beforeBranchSp = previousSp;
        // Branch to subroutine at address 3000
        cpu.cycle(); expect(cpu.getRegister("pc")).equals(0x3000);
        // Cal has 11 pushes and then the stack frame size is pushed (12)
        expect(cpu.getRegister("sp")).equals(previousSp - 11 * 2 - 2);
        previousSp = previousSp - 11 * 2 - 2;
        expect(cpu.getRegister("fp")).equals(previousSp);

        // 3 pushes are made in the subroutine
        [0x102, 0x304, 0x0506].forEach(value => {
            cpu.cycle();
            expect(cpu.getRegister("sp")).equals(previousSp - 2); 
            expect(cpu.viewMemoryAt(previousSp, 2, false)).equals(value); previousSp = cpu.getRegister("sp");
        });

        // Modify our register in the new frame
        cpu.cycle(); expect(cpu.getRegister("r1")).equals(0x0708);
        cpu.cycle(); expect(cpu.getRegister("r4")).equals(0x090A);

        // Now return to the old frame : everything should be restored
        cpu.cycle();
        cpu.cycle(); expect(cpu.getRegister("r1")).equals(0x1234);
        cpu.cycle(); expect(cpu.getRegister("r4")).equals(0x5151);
        expect(cpu.getRegister("sp")).equals(beforeBranchSp + 2); // We pop arg number (psh 0) so + 2
    });
});