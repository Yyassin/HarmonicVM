import { Table, TableCaption, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/table";
import React from "react";
import { registersSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";

const Registers = () => {
    const registers = useAppSelector(registersSelector);
  
    const registerTable = Object.keys(registers).map((label, idx) => (
      // <div key={idx}>{`${label}\t\t\t:\t${registers[label]}`}</div>

      <Tr key={ idx }>
        <Th style={{ color: (label === "pc") ? "rgba(165, 245, 191, 0.9)" : (label === "sp") ? "rgba(216, 165, 245, 0.9)" : "inherit" }}>{ label }</Th>
        <Td >{ registers[label] }</Td>
      </Tr>
    ))

    return (
      <Table size="sm" height="94.6%" variant="striped" colorScheme="twitter">
        {/* <TableCaption>Register Bank</TableCaption> */}
        <Thead>
          <Tr>
            <Th>Register</Th>
            <Th isNumeric>Contents</Th>
          </Tr>
        </Thead>
        <Tbody>
          { registerTable }
        </Tbody>
      </Table>
    );
  }

  export default Registers;