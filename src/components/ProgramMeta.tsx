import React, { useEffect, useState } from "react";
import { Pre, Line, LineNo, LineContent } from "./styles";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useAppSelector } from "../store";
import { metaSelector, pcSelector } from "../reducers/memoryReducer";
import "./memoryStyles.css";
import { Scrollbars } from 'react-custom-scrollbars';
import { Select } from "@chakra-ui/react";

/**
 * ProgramMeta component that highlights the parsed and stored
 * instructions (i.e the abstract syntax tree) using Prisma.
 * @returns JSX.Element, the ProgramMeta component.
 */
const ProgramMeta = () => {
    const [base, setBase] = useState<string | null>("0");   // The base address to display meta for (incase of subroutines)
    const instructions = useAppSelector(metaSelector);      // The abstract syntax tree in state (as sequential array of instructions )
    const pc = useAppSelector(pcSelector);                  // Current pc value -> highlight pointed instruction

    /**
     * Highlight the current instruction that pc is pointing at
     */
    useEffect(() => {
        const pcLine = document.getElementsByClassName(`line-0x${pc.toString(16).padStart(4, "0")}`);

        let pcElem;
        if (pcLine[0]) {
            pcElem = pcLine[0];
            pcElem.classList.add('pointed-pc-line');
        }

        return () => {
            pcElem?.classList.remove('pointed-pc-line');
        }
    })

    /** Create the instruction list */

    // Assert we have parsed instructions to display.
    if (!instructions) { return null; }
    // If instruction at base doesn't exist, default to first address.
    if (!instructions[base]) { setBase(Object.keys(instructions)[0]); return null; }
    // Assert that instructions at base exist.
    if (!instructions[base].length) { return null; }

    // Format the instructions as a string to be displayed 
    const exampleCode = instructions[base].map(instruction => (
        `${instruction.instruction} \t` + instruction.args.reduce((argString, arg, idx) => {    // Add a tab following mnemonic
            const punctuation = (idx === instruction.args.length - 1) ? "" : ","                // Comma after first arg
            argString += `${arg}${punctuation} `;
            return argString;
        }, "")
    )).join("\n");  


    // Render thumb for scrollbar 
    const renderThumb = ({ style, ...props }) => {
      const thumbStyle = {
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
      };
      return (
          <div
              style={{ ...style, ...thumbStyle, borderRadius: '10px' }}
              {...props}/>
      );
    };

    return (
        <div style={{height: "100%", width: "100%", position: "relative"}}>
          <Select
            position={"relative"}
            left={"calc(100% - 160px)"}
            zIndex={2}
            width={40}
            height={10}
            marginTop={-10}
            marginBottom={-10}
            bg='#272430'
            borderColor='#272430'
            color='#9A86EA'
            fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace;"}
            defaultValue={Object.keys(instructions)[0]}
            onChange={e => setBase(e.target.value)}
          >
              {
                // Line numbers as hexadecimal address
                Object.keys(instructions).map((instructionBase, idx) => 
                  <option key={idx} value={instructionBase}>{`0x${parseInt(instructionBase, 16).toString(16).padStart(4, "0")}`}</option>
                )
              }
          </Select>
          <Highlight
            {...defaultProps}
            code={exampleCode}
            language="jsx"
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <Pre className={className} style={{...style}}>
                  <Scrollbars
                    autoHide
                    autoHideTimeout={1000}        
                    autoHideDuration={500}
                    renderThumbVertical={renderThumb}
                    renderView={
                      () => <div style={{
                          display: "flex", 
                          flexDirection: "column",
                          position: "absolute",
                          inset: "0px",
                          overflow: "scroll",
                          marginRight: "-17px",
                          marginBottom: "-17px",
                          paddingBottom: "100px"
                        }}></div>
                    }
                  >
                  {tokens.map((line, index) => {      // Display each line
                    const lineProps = getLineProps({ line, key: index });
                    lineProps.className += ` line-${`0x${instructions[base][index].index.toString(16).padStart(4, "0")}`}`;
                    
                    return (
                      <Line key={index} {...lineProps} >
                        <LineNo>{`0x${instructions[base][index].index.toString(16).padStart(4, "0")}`}</LineNo>
                        <LineContent>
                          {line.map((token, key) => (
                            <span style={{
                                width: 180,
                                minWidth: 180,
                                maxWidth: 180
                            }} key={key} {...getTokenProps({ token, key })} />
                          ))}
                        </LineContent>
                      </Line>
                    );
                  })}
                  </Scrollbars>
                </Pre>
              )}
          </Highlight>
        </div>
    );
}

export default ProgramMeta;