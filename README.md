# HarmonicVM
> **HarmonicVM** is a simple implementation of a virtual computer --- a processing unit that interfaces main memory to execute a set of assembly instructions.

## Usage
## Instruction Set Architecture
A RISC Architecture
*Disclaimer*: There is no logical background for choosing the opcodes (slight regret xD).

### General Syntax
### Arithmetic
| Instruction  | Type           | Syntax        | Function              | Opcode   |
| :---         | :---           | :---          | :---                  |:---      |
| ADD          | reg_reg        | `add r7, r4`  | acc ← [r7] + [r4]     | 0x14     |
| ADD          | lit_reg        | `add $D4, r4` | acc ← 0xD4 + [r4]     | 0x3F     | 

- Interrupts (in language, functionality is there)
- Comments
- Syntax Highlighting
- Dynamic print
- error (popping twice)

<span title="harmonic demo gif">
 <p align="left">
  <img src="./public/assets/hex.gif" alt="demo-gif">
 </p>
</span>

<span title="harmonic demo gif">
 <p align="left">
  <img src="./public/assets/hex.PNG" alt="demo-img">
 </p>
</span>

<span title="harmonic demo gif">
 <p align="left">
  <img src="./public/assets/hex2.PNG" alt="demo-img2">
 </p>
</span>

```assembly
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
