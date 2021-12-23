import { configureStore, createSerializableStateInvariantMiddleware, isPlain } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import CPU from "./harmonic/src/cpu/CPU";
import memoryReducer from "./reducers/memoryReducer";

// Not Recommended: Override the toolkit serializable check
// since typed arrays are not serializable. However, we need them to properly 
// interpret the stored data as unsigned 8-bit values.
const isTypedArrayOrCPU = (value: any) => {
    if (!value || !(typeof value === "object")) { return false; }
    const isDataView = (value.constructor === DataView);
    const isUint8Array = (value.constructor === Uint8Array);
    const isCPU = (value.constructor === CPU);
    return isDataView || isUint8Array || isCPU;
};

// Augment middleware to consider typed array buffers and CPU class as serializable
const isSerializable = (value: any) => isTypedArrayOrCPU(value) || isPlain(value)
const serializableMiddleware = createSerializableStateInvariantMiddleware({
  isSerializable,
})

// State (Main Memory)
export const store = configureStore({
    reducer: {
        memory: memoryReducer,
    },
    middleware: [serializableMiddleware]
});

// Inferred Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;