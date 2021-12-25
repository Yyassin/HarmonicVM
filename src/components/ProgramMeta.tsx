import React, { useEffect } from "react";
import { Pre, Line, LineNo, LineContent } from "./styles";
import Highlight, { defaultProps } from "prism-react-renderer";
import { useAppSelector } from "../store";
import { metaSelector, pcSelector } from "../reducers/memoryReducer";
import "./memoryStyles.css";
import { Scrollbars } from 'react-custom-scrollbars';
import { instruction } from "../harmonic/src/assembler/parser/instructions/instructions";


const ProgramMeta = () => {
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

    console.log(instructions)
    if (!instructions || !instructions.length) { return null; }

    const exampleCode = instructions.map(instruction => (
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
                        marginBottom: "-17px"
                      }}></div>
                  }
                >
                {tokens.map((line, index) => {
                  const lineProps = getLineProps({ line, key: index });
                  lineProps.className += ` line-${`0x${instructions[index].index.toString(16).padStart(4, "0")}`}`;
                  
                  return (
                    <Line key={index} {...lineProps} >
                      <LineNo>{`0x${instructions[index].index.toString(16).padStart(4, "0")}`}</LineNo>
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
    );
}

export default ProgramMeta;