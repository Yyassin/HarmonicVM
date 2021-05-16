import type { Memory } from '../types';

export const createMemory = (bytes: number): Memory => {
    // Memory => typed array of bytes : interpret as signed or unsigned.
    const ab = new ArrayBuffer(bytes);
    const dv = new DataView(ab);        // Indexed by bytes!
    return dv;
};