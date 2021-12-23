import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { init, VM } from "../harmonic";
import { Memory } from "../harmonic/src/types";
import CPU from "../harmonic/src/cpu/CPU";

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
        initMachine: (state, action: PayloadAction<number[]>) => {
            const program = action.payload;
            initVM(new Uint8Array(program));

            return {
                ...state,
                ...vm
            }
        },
        step: (state) => {
            vm.cpu.cycle();

            console.log(vm.cpu.getRegister('pc'));
            return {
                ...state,
                ...vm
            }
        },
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

// Selectors
export const registersSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegisterBank(),
    (registers: any) => {
        console.log("called registers");
        console.log(registers);

        return registers;
    }
);

export const pcSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegister('pc'),
    (pc: number) => {
        console.log("called pc");
        console.log(pc);

        return pc;
    }
);

export const spSelector = createSelector(
    (state: RootState) => state.memory.cpu.getRegister('sp'),
    (sp: number) => {
        console.log("called sp");
        console.log(sp);

        return sp;
    }
);

export const metaSelector = createSelector(
    (state: RootState) => state.memory.meta,
    (meta: any) => {  
        console.log("selector: ", meta)
        return meta;
    }
);

export const memorySelector = createSelector(
    (state: RootState) => state.memory.memory,
    (memory: Memory) => {  
        console.log("memory:")
        console.log(memory)

        return memory;
    }
);

export default memoryReducer.reducer;