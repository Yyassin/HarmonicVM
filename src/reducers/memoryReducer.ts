import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { init, VM } from "../harmonic";
import { Memory } from "../harmonic/src/types";
import CPU from "../harmonic/src/cpu/CPU";

// Initializes the machine
let vm: VM;
export const initVM = (program: Uint8Array) => {
    vm = init(program);
};

// State type
interface MemoryState {
    memory: Memory,
    cpu: CPU,
    meta: any
}

initVM(new Uint8Array([]));
const initialState: MemoryState = {
    memory: vm.memory,
    cpu: vm.cpu,
    meta: null
}

export const memoryReducer = createSlice({
    name: 'memory',
    initialState,
    reducers: {
        // Initialization
        initMachine: (state, action: PayloadAction<number[]>) => {
            const program = action.payload;
            initVM(new Uint8Array(program));

            return {
                ...state,
                ...vm
            }
        },
        // Execute and step through instruction
        step: (state) => {
            vm.cpu.cycle();

            // console.log(vm.cpu.getRegister('pc'));
            return {
                ...state,
                ...vm
            }
        },
        // Sets up metadata corresponding to parsed assembly
        setMeta: (state, action: PayloadAction<any>) => {
            const meta = action.payload;
            return {
                ...state,
                meta: [...meta]
            }
        }
    }
})

export const { step, initMachine, setMeta } = memoryReducer.actions;

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

export const memorySelector = createSelector(
    (state: RootState) => state.memory.memory,
    (memory: Memory) => {  
        return memory;
    }
);

export default memoryReducer.reducer;
