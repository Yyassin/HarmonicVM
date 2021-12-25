import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { assemble } from "../harmonic/src/assembler";
import { initMachine, setMeta } from "../reducers/memoryReducer";
import { useAppDispatch } from "../store";
import Monaco, { useMonaco } from "@monaco-editor/react";
import { Button } from "@chakra-ui/button";
import { editor } from "monaco-editor";
import useHarmonic from "./langauge";
import ProgramMeta from "./ProgramMeta";

enum EditorType {
    ASSEMBLY="ASSEMBLY",
    MACHINE_CODE="MACHINE_CODE"
}

const Editor = (props, ref) => {
    const assemblyCode = useRef("");
    const machineCode = useRef("");
    const [editor, setEditor] = useState(EditorType.ASSEMBLY);
    const dispatch = useAppDispatch();
    const editorRef = useRef(null);
    const languageID = useHarmonic();

    const saveAssembly = () => assemblyCode.current = editorRef.current.getValue();
    const format = (text: string): string => text.replace(/(?:\r\n|\r|\n)/g, '\n'); // Need to replace \r\n with \n since regex is hard

    const generateMachineCode = () => {
        saveAssembly();

        let assembled: number[], parsedInstructions: any[];
        try {
            ({ assembled, parsedInstructions } = assemble(format(assemblyCode.current.trim() + "\n")));
        } catch (e) {
            console.log("Error: ", e.message);
            return;
        }

        machineCode.current = assembled.reduce((code, byte, idx) => {
            code += `0x${byte.toString(16).padStart(2, "0")}` + " ";
            return code;
        }, "");

        dispatch(setMeta(parsedInstructions));
        setEditor(EditorType.MACHINE_CODE);
    }

    const loadBinary = () =>{ 
        const binaryBuffer = machineCode.current.split(" ").map(byte => parseInt(byte, 16));
        dispatch(initMachine(binaryBuffer));
    }

    useImperativeHandle(ref, () => ({
        generateMachineCode () {
            generateMachineCode();
        },
        loadBinary () {
            loadBinary();
        }
    }), []);

    if (!languageID) { return null; }

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    }

    return (
        <>
        <div className="tab-area">
            <button className={(editor === EditorType.ASSEMBLY) ? "editor-tab active" : "editor-tab"} onClick={() => setEditor(EditorType.ASSEMBLY)}>Assembly</button>
            <button disabled={!machineCode.current} className={(editor === EditorType.MACHINE_CODE) ? "editor-tab active" : "editor-tab"} onClick={() => setEditor(EditorType.MACHINE_CODE)}>Loader</button>
        </div>
        <div className="editor">
            <Monaco 
                height={(editor === EditorType.ASSEMBLY) ? "80%" : "50%"}
                value={(editor === EditorType.ASSEMBLY) ? assemblyCode.current : machineCode.current}
                onChange={ saveAssembly }
                language={ languageID }
                onMount={ handleEditorDidMount }
                theme="vs-dark"
            />       
            {
                (editor === EditorType.MACHINE_CODE) &&
                <div style={{height: "44%"}}>
                    <ProgramMeta />
                </div>
            }     
        </div>
        </>
    )
}

export default forwardRef(Editor);