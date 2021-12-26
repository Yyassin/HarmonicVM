import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/input";
import { Table, TableCaption, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Memory } from "../harmonic/src/types";
import { memorySelector, pcSelector, spSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";
import './memoryStyles.css';

const MAX_ADDRESS = 0xffff;
/*
Start 0x00
0x0000    -- -- -- --
0x0004    -- -- -- --
0x0008    -- -- -- -- 
0x000C    -- -- -- -- 
0x0010    -- -- -- -- 
*/

const getMemoryRow = (memory: Memory, n: number, base: number) => {

    const nextNBytes = Array.from({length: n}, (_, i) => {
        const address = base + i;
        let byte: number;
        try {
            byte = memory.getUint8(address)
        } catch (e) {
            // Catch this with popup
            // throw new Error(e.msg)
            console.log(e.msg);
            byte = MAX_ADDRESS;
        }
        return { byte, address }
    }).map(({ byte, address }) => {
        const formattedByte = 
            address <= MAX_ADDRESS ?
            byte ? `0x${byte.toString(16).padStart(2, '0')}\t` : `0x00\t`
            :
            ``
        const byteID = `mmem-${address}`;

        return { byte: formattedByte, id: byteID };
    });

    return nextNBytes;
}

const MainMemory = ({ end, tableCaption }: any, ref) => {
    const memory = useAppSelector(memorySelector);
    const pc = useAppSelector(pcSelector);
    const sp = useAppSelector(spSelector);
    const rows = 7;
    const cols = 4;
    
    const getBase = () => {
        if (end) {
            return (end - rows * cols);
        }
        return Math.floor(pc / (rows * cols)) * (rows * cols);
    }
    const [base, setBase] = useState(getBase());

    useEffect(() => {
        setBase(getBase())
    }, [pc])

    const memoryTable = (base: number, rows: number, columns: number) => {
        const memoryRows = [] as any[];

        for (let i = base; i < base + rows * columns && i < 0xffff; i += columns) {
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
                    
                    { memoryRows.map((row, idx) => (
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

    useEffect(() => {
        const pcCell = document.getElementsByClassName(`mmem-${pc}`);
        const spCell = document.getElementsByClassName(`mmem-${sp}`);

        let pcElem;
        let spElem;
        if (pcCell[0]) {
            pcElem = pcCell[0];
            pcElem.classList.add('pointed-pc');
        }
        if (spCell[0]) {
            spElem = spCell[0];
            spElem.classList.add('pointed-sp');
        }

        
        return () => {
            pcElem?.classList.remove('pointed-pc');
            spElem?.classList.remove('pointed-sp');
        }
    })

    const setBaseWrapped = (value: number) => {
        console.log("called")
        isNaN(value) ? setBase(getBase()) : setBase(value);
    }

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