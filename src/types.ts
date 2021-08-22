export type Memory = DataView;

export interface IMemory {
    getUint16: (byteOffset: number, littleEndian?: boolean) => number;
    getUint8: (byteOffset: number) => number;
    setUint16: (byteOffset: number, value: number) => void;
    setUint8: (byteOffset: number, value: number) => void;
}