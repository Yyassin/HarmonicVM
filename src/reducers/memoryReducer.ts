import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { init, VM } from "../harmonic";
import { Memory } from "../harmonic/src/types";
import CPU from "../harmonic/src/cpu/CPU";

// Initializes the machine
let vm: VM;
export const initVM = (program: Uint8Array, base: number = 0, previousMemory: Uint8Array = null) => {
    vm = init(program, base, previousMemory);
};

// State type
interface MemoryState {
    memory: Memory,
    cpu: CPU,
    meta: any,
    writableBytes: Uint8Array,
    halt: boolean
}

initVM(new Uint8Array([]));
const initialState: MemoryState = {
    memory: vm.memory,
    cpu: vm.cpu,
    meta: null,
    writableBytes: vm.writableBytes,
    halt: false
}

export const memoryReducer = createSlice({
    name: 'memory',
    initialState,
    reducers: {
        // Initialization
        initMachine: (state, action: PayloadAction<{program: number[], base: number, reset?: boolean}>) => {
            const { program, base, reset } = action.payload;
            initVM(new Uint8Array(program), base, reset ? null :state.writableBytes);

            return {
                ...state,
                ...vm
            }
        },
        // Execute and step through instruction
        step: (state) => {
            const halt = vm.cpu.cycle();

            // console.log(vm.cpu.getRegister('pc'));
            return {
                ...state,
                ...vm, 
                halt: halt || false
            }
        },
        // Sets up metadata corresponding to parsed assembly
        setMeta: (state, action: PayloadAction<{meta: any, base: number, reset: boolean}>) => {
            const {meta, base, reset} = action.payload;

            return {
                ...state,
                meta: reset ? {[base.toString(16)]: [...meta] } : {...state.meta,  [base.toString(16)]: [...meta] }
            }
        },

        resetHalt: (state) => {
            return {
                ...state,
                halt: false
            }
        }
    }
})

export const { step, initMachine, setMeta, resetHalt } = memoryReducer.actions;

/** Selectors **/
export const registersSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegisterBank(),
    (registers: any) => {
        return registers;
    }
);

export const pcSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegister('pc'),
    (pc: number) => {
        return pc;
    }
);

export const spSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegister('sp'),
    (sp: number) => {
        return sp;
    }
);

export const metaSelector = createSelector(
    (state: RootState) => state.memory.meta,
    (meta: any) => {  
        return meta;
    }
);

export const haltSelector = createSelector(
    (state: RootState) => state.memory.halt,
    (halt: boolean) => {  
        return halt;
    }
);

export const memorySelector = createSelector(
    (state: RootState) => state.memory.memory,
    (memory: Memory) => {  
        return memory;
    }
);

export default memoryReducer.reducer;
