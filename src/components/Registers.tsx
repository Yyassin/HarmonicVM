import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import React from "react";
import { registersSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";

/**
 * View of vm registers.
 */
const Registers = () => {
    const registers = useAppSelector(registersSelector);  // The registers
  
    // Map each register into the table.
    const registerTable = Object.keys(registers).map((label, idx) => (
      <Tr key={ idx }>
        <Th style={{ color: (label === "pc") ? "rgba(165, 245, 191, 0.9)" : (label === "sp") ? "rgba(216, 165, 245, 0.9)" : "inherit" }}>{ label }</Th>
        <Td >{ registers[label] }</Td>
      </Tr>
    ))

    return (
      <Table size="sm" height="94.6%" variant="striped" colorScheme="twitter">
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