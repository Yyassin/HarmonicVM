import React, { useEffect, useState } from "react";
import { Pre, Line, LineNo, LineContent } from "./styles";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useAppSelector } from "../store";
import { metaSelector, pcSelector } from "../reducers/memoryReducer";
import "./memoryStyles.css";
import { Scrollbars } from 'react-custom-scrollbars';
import { Select } from "@chakra-ui/react";
import { instruction } from "../harmonic/src/assembler/parser/instructions/instructions";

const ProgramMeta = () => {
    const [base, setBase] = useState<string | null>("0");
    const instructions = useAppSelector(metaSelector);
    const pc = useAppSelector(pcSelector);

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

    if (!instructions[base]) { setBase(Object.keys(instructions)[0]); return null; }
    if (!instructions || !instructions[base].length) { return null; }

    const exampleCode = instructions[base].map(instruction => (
        `${instruction.instruction} \t` + instruction.args.reduce((argString, arg, idx) => {
            const punctuation = (idx === instruction.args.length - 1) ? "" : ","
            argString += `${arg}${punctuation} `;
            return argString;
        }, "")
    )).join("\n");

    const renderThumb = ({ style, ...props }) => {
      const thumbStyle = {
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
      };
      return (
          <div
              style={{ ...style, ...thumbStyle, borderRadius: '10px' }}
              {...props}/>
      );
  }
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
                  {tokens.map((line, index) => {
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