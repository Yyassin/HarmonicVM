import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Memory } from "../harmonic/src/types";
import { memorySelector, pcSelector, spSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";
import './memoryStyles.css';

/*
Start 0x00
0x0000    -- -- -- --
0x0004    -- -- -- --
0x0008    -- -- -- -- 
0x000C    -- -- -- -- 
0x0010    -- -- -- -- 
*/

// Maximum 16 bit address
const MAX_ADDRESS = 0xffff;

/**
 * Gets next n bytes (row) of memory contents from the specified base address. 
 * @param memory Memory, the vm's memory.
 * @param n number, the number of bytes in the row.
 * @param base number, the base address.
 * @returns the next n bytes.
 */
type Byte = { byte: string; id: string; };
const getMemoryRow = (memory: Memory, n: number, base: number): Byte[] => {
    const nextNBytes = Array.from({length: n}, (_, i) => {                      // Create an array of value, address pairs
        const address = base + i;
        let byte: number;
        try {
            byte = memory.getUint8(address)
        } catch (e) {
            console.log(e.msg);
            byte = MAX_ADDRESS;
        }
        return { byte, address }
    }).map(({ byte, address }) => {                                             // And map it to an array of formatted value, id pairs
        const formattedByte =                                                   // id is simply mmem-address for css targetting
            address <= MAX_ADDRESS ?
            byte ? `0x${byte.toString(16).padStart(2, '0')}\t` : `0x00\t`
            :
            ``
        const byteID = `mmem-${address}`;

        return { byte: formattedByte, id: byteID };
    });

    return nextNBytes;
}

/**
 * A table view of main memory
 * @param props MainMemoryProps, end is the max address. Caption is the table name (unused now). 
 * @param ref, forward ref to set base address externally (bad, yes).
 * @returns JSX.Element, the main memory component.
 */
type MainMemoryProps = { end?: number, tableCaption?: string };
const MainMemory = ({ end, tableCaption }: MainMemoryProps, ref) => {
    const memory = useAppSelector(memorySelector);      // The memory bank in state 
    const pc = useAppSelector(pcSelector);              // The program counter in state
    const sp = useAppSelector(spSelector);              // The stack pointer in state
    const rows = 7;                                     // Maximum amount of rows
    const cols = 4;                                     // Maximum amount of columns
    
    /**
     * Acquires the base address based on the end address and 
     * amount of cells.
     * @returns 
     */
    const getBase = () => {
        if (end) {
            return (end - rows * cols);     // end specified: base is end - num_cells
        }

        return Math.floor(pc / (rows * cols)) * (rows * cols);  // default to beginning of page containing pc (floor remainder * num_cells)
    }
    const [base, setBase] = useState(getBase());                // Base, defaults to above

    // If pc ever changes, update getBase (for continual running / step)
    useEffect(() => {
        setBase(getBase())
    }, [pc])

    const memoryTable = (base: number, rows: number, columns: number) => {
        const memoryRows = [] as any[];                                                 // Stores the values in memory for each table row

        for (let i = base; i < base + rows * columns && i < 0xffff; i += columns) {     // Fill the table rows
            memoryRows.push(getMemoryRow(memory, columns, i));
        }

        return (
            <Table size="sm" height="89%" variant="striped" colorScheme="twitter" marginBottom={"5px"}>
                <Thead>
                    <Tr>
                        <Th>Address</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    
                    { memoryRows.map((row, idx) => (                                    // Format table rows into table
                        <Tr>
                            <Th>{ `0x${(base + idx * columns).toString(16).padStart(4, '0')}:\t` }</Th>
                                { row.map(({byte, id}) => (
                                    <Td className={ id }>{ byte }</Td>
                                ))
                                }
                        </Tr>
                    ))
                    }
                </Tbody>
            </Table>
        )
    }

    /**
     * UseEffect to highlight the cells pointed at by pc and sp.
     */
    useEffect(() => {
        const pcCell = document.getElementsByClassName(`mmem-${pc}`);
        const spCell = document.getElementsByClassName(`mmem-${sp}`);

        let pcElem;
        let spElem;

        // Add a class to target in css
        if (pcCell[0]) {
            pcElem = pcCell[0];
            pcElem.classList.add('pointed-pc');
        }
        if (spCell[0]) {
            spElem = spCell[0];
            spElem.classList.add('pointed-sp');
        }

        // Before calling the next useEffect, clear the classes.
        return () => {
            pcElem?.classList.remove('pointed-pc');
            spElem?.classList.remove('pointed-sp');
        }
    })

    // Protectively set the base value -> if invalid, default to setBase.
    const setBaseWrapped = (value: number) => {
        isNaN(value) ? setBase(getBase()) : setBase(value);
    }

    // Forward setBase to be set externally via input in ProgramTables.
    useImperativeHandle(ref, () => ({
        setBaseWrapped (value: number) {
            setBaseWrapped(value);
        }
    }), []);

    return (
      memoryTable(base, rows, cols)
    );
  }

  export default forwardRef(MainMemory);
