import { Heading } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/react";
import React, { useRef } from "react";
import MainMemory from "./Memory";
import Registers from "./Registers";
import Stack from "./Stack";

const ProgramTables = () => {
    const memoryRef = useRef<any>();

    return(
    <div className="program-wrapper">
        <div className="registers">
            <Heading>Registers</Heading>
            <Registers />
        </div>
        <div className="memory-col">
            <div style={{display: "block", minHeight: "305px"}}>
                <div className="memory-head">
                    <Heading>Main Memory</Heading>
                    <Input 
                        defaultValue={"0000"}
                        color={"blue.600"}
                        fontWeight={"bold"} 
                        maxLength={4} 
                        width={"60px"}
                        fontSize={"18px"} 
                        padding={"5px"}
                        onChange={event => {
                            console.log(memoryRef);
                            memoryRef.current && memoryRef.current.setBaseWrapped(parseInt(event.target.value, 16))
                        }}
                    >
                    </Input>
                </div>  
                <MainMemory ref={memoryRef}/>
            </div>
            <div className="stack">
                <Heading>Stack</Heading>
                <Stack />
            </div>
        </div>
    </div>
    );
};

export default ProgramTables;