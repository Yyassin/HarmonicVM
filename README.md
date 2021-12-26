# HarmonicVM
> **HarmonicVM** is a simple implementation of a virtual machine --- a processing unit that interfaces main memory to execute a set of instructions. The application consists of a byte-code that defines and executes a custom instruction set in addition to a frontend client that allows interfacing with the vm. The client features two editors: one for assembly, the other machine code, and the ability to load instruction into memory and step through execution.

<span float="left" title="harmonic main page img">
 <p float="left">
  <img width="481vw" src="./public/assets/hex.PNG" alt="demo-img">
  <img width="481vw" src="./public/assets/hex2.PNG" alt="demo-img2">
 </p>
</span>

## Table of Contents
<!--ts-->
   * [Demo](#demo)
   * [Features](#features)
   * [Your First Program](#your-first-program)
   * [Next Steps](#next-steps)
   * [Documentation](#documentation)
      * [General Syntax](#general-syntax)
      * [Instruction Set Architecture](#instruction-set-architecture)
         * [Arithmetic](#arithmetic)
   * [Credits](#credits)
      

<!--te-->

## Demo 
<span title="harmonic demo gif">
 <p align="left">
  <img width="800vw" src="./public/assets/hex.gif" alt="demo-gif">
 </p>
</span>

## Features
Here are some of the features Harmonic boasts
- A custom byte-code vm that implements the instruction set architecture documented below.
- A parser(-combinator) that parses Harmonic assembly into the associated byte-code.
- On the frontend, we have
   - A tabbed-editor that supports writing Harmonic assembly and byte-code (if you're into that)     along with syntax highlighting.
   - Helpful... semi-helpful messages to identify syntax errors. 
   - Table views of internal machine state: specifically general purpose registers, main memory and the stack.
   - The ability to load machine code anywhere in main memory and begin execution: either step by step or continual running of the program (I suggest using the `hlt` instruction for the latter).

## Your First Program
To help you get started with using Harmonic, let's walk-through writing and loading the machine-code that implements a program to compute the nth fibonacci number. In our case, the 10th number.
1. First, head over to the Harmonic wesbite [!here]().
2. Copy the assembly code below into the "Assembly" tab then click the "Assemble" option in the menu.
3. The editor should switch to the "Loader" tab and display the binary string that represents the machine code of the assembled program. Below, you'll also notice all the instructions that were parsed. 
4. Make sure the load address in the menu is still 0 and select the "Load" option to load the program into main memory - you should be able to see the contents loaded.
5. Once loaded, you're ready to execute the program. Use the "Step" option to execute instruction by instruction or the "Run" option to continuously step through the program. The step speed for "Run" can be modified with the slider but will only take effect on the next execution.
6. Try using the "Run" option and letting it run. The program will stop, due to the `hlt` instruction, once the 10th fibonacci number has been calculated and its value - 0x59 or 89 - placed in `r2`. 

```assembly
    ; Harmonic Assembly Script to calculate 10th fibonacci term in r2
    
    ; Declare constants
    constant term = $a      ; The number of fibonacci terms 
                            ; to calculate (10)
    constant fn2 = $3000    ; f(n-2)

    ; The sequence below is not efficient
    ; but is used to show off some instructions

    ; r1 is used to store f(n-1), r2 stores f(n-2)

    mov [!term], r0   ; Set r0 to the number of fib terms      

    mov $0, &[!fn2]   ; Set memory address 0x3000 as 0
    psh $1            ; push 0x1 on the stack

    mov &[!fn2], r1   ; Set r1 to the value of memory @ 0x3000
    pop r2            ; pop top of stack (0x1) into r2


    ; The main iterative fibonacci loop
    loop: 
        add r1, r2      ; Calculate the next fib term f(n)
        mov r2, r1      ; update f(n-2) as f(n-1)
        mov acc, r2     ; update f(n-1) as f(n) -> getting ready 
                        ; for next iteration

        dec r0              ; decrement r0 (emulates a while loop)

        sub r0, $0          ; compare r0 and 0
        jne $0, &[!loop]    ; do { } while (r0 > 0)

    hlt     ; halt so that the vm pauses once the program is done
```

## Next Steps
#### High Level Language Support
I'd like to add one more editor tab and corresponding parser/compiler to support compiling a high-level C-like language to Harmonic assembly (hopefully coming soon!).

#### External Input/Output (IO)
Adding a display output to show printed content / displays along with potential to buffer input during runtime.

#### Interrupt (in language)
Interrupts (Interrupt Requests and Interrupt Service Routines) are already implemented in the byte-code vm but are not available from the client. This is becuase they only really make sense as a response to some event - and as it currently stands, we have no asynchronous events happening. That changes if we implement IO so it would make sense to enable interrupts at the same time.

#### Dynamic Meta Data
The meta data is decent currently - allowing users to see the parsed instructions at a given loaded address. It can be improved by allowing any sequence of memory from a given  base address to be parsed dynamically (akin to a reverse lookup).

#### Context Error Detection
Well first, syntax error UX can and should probably be improved. It would also be nice to be able to detect or display helpful errors on logical errors such as popping the stack too many times (i.e pop without a push).

## Documentation
### General Syntax

- `statement`:

- `comments`: Comments are identified by a leading semicolon.
`; This is a comment!`

- `registers`:

- `literals`:

- `labels`:

- `addresses`:

- `constants`:

- `structures`:

- `arrays`:



### Instruction Set Architecture
Harmonic adapts a Reduced Instruction Set Computer (RISC) Architecture, meaning each instruction has been implemented to do one single very specific task. Namely, the VM exhibits a load-and-store architecture such that most instructions consist of moving data to and from registers and memory, in addition to the expected arithmetic functionality. A list of instructions and their functions has been provided in the table below.

*Disclaimer*: There is no logical background for the opcode selection (slight regret).

#### Arithmetic
| Instruction  | Type           | Syntax        | Function              | Opcode   |
| :---         | :---           | :---          | :---                  |:---      |
| ADD          | reg_reg        | `add r7, r4`  | acc ← [r7] + [r4]     | 0x14     |
| ADD          | lit_reg        | `add $D4, r4` | acc ← 0xD4 + [r4]     | 0x3F     | 

#### Logical
| Instruction  | Type           | Syntax        | Function              | Opcode   |
| :---         | :---           | :---          | :---                  |:---      |
| ADD          | reg_reg        | `add r7, r4`  | acc ← [r7] + [r4]     | 0x14     |
| ADD          | lit_reg        | `add $D4, r4` | acc ← 0xD4 + [r4]     | 0x3F     | 

#### Load and Store
| Instruction  | Type           | Syntax        | Function              | Opcode   |
| :---         | :---           | :---          | :---                  |:---      |
| ADD          | reg_reg        | `add r7, r4`  | acc ← [r7] + [r4]     | 0x14     |
| ADD          | lit_reg        | `add $D4, r4` | acc ← 0xD4 + [r4]     | 0x3F     | 

#### Other
| Instruction  | Type           | Syntax        | Function              | Opcode   |
| :---         | :---           | :---          | :---                  |:---      |
| ADD          | reg_reg        | `add r7, r4`  | acc ← [r7] + [r4]     | 0x14     |
| ADD          | lit_reg        | `add $D4, r4` | acc ← 0xD4 + [r4]     | 0x3F     | 

## Credits
A significant portion of this project has been inspired by and supplemented by a series made by Francis Stokes.
