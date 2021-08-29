import { IMemory, Memory } from "../types";

type Device = Memory | IMemory;

interface Region {
    device: Device;
    start: number;
    end: number;
    remap: boolean;
}

class MemoryMapper {
    #regions: Region[];

    constructor() {
        this.#regions = [] as Region[];
    }

    map(device: Device, start: number, end: number, remap: boolean = true) {
        const region: Region = {
            device, 
            start,
            end,
            remap
        };

        // Find most recently mapped region while searching
        this.#regions.unshift(region);

        // Callback to unmap region
        return () => {
            this.#regions = this.#regions.filter(cRegion => cRegion !== region);
        };
    }

    // Find region for address
    findRegion(address: number) {
        const region = this.#regions.find(
            region => address >= region.start && address <= region.end
        );

        // Address space is unmapped
        if (!region) {
            throw new Error(`No memory region found for address ${address}.`)
        }

        return region;
    }

    getUint16(address: number) {
        const region = this.findRegion(address);

        // Remap the specified address
        const finalAddress = region.remap ?
            address - region.start
            :
            address;

        return region.device.getUint16(finalAddress);
    }

    getUint8(address: number) {
        const region = this.findRegion(address);

        // Remap the specified address
        const finalAddress = region.remap ?
            address - region.start
            :
            address;

        return region.device.getUint8(finalAddress);
    }

    setUint16(address: number, value: number) {
        const region = this.findRegion(address);

        // Remap the specified address
        const finalAddress = region.remap ?
            address - region.start
            :
            address;

        return region.device.setUint16(finalAddress, value);
    }

    setUint8(address: number, value: number) {
        const region = this.findRegion(address);

        // Remap the specified address
        const finalAddress = region.remap ?
            address - region.start
            :
            address;

        return region.device.setUint8(finalAddress, value);
    }
}

export default MemoryMapper;