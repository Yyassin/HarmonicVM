import { Heading } from "@chakra-ui/layout";
import React from "react";
import MainMemory from "./Memory";
import Registers from "./Registers";
import Stack from "./Stack";

const ProgramTables = () => (
    <div className="program-wrapper">
        <div className="registers">
            <Heading>Registers</Heading>
            <Registers />
        </div>
        <div className="memory-col">
            <div>
            <Heading>Main Memory</Heading>
            <MainMemory />
            </div>
            <div className="stack">
            <Heading>Stack</Heading>
            <Stack />
            </div>
        </div>
    </div>
);

export default ProgramTables;