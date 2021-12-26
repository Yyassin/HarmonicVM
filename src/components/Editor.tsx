import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { assemble } from "../harmonic/src/assembler";
import { initMachine, setMeta } from "../reducers/memoryReducer";
import { useAppDispatch } from "../store";
import { ToastContainer } from "react-toastify";
import { toastSuccess, toastError, dismissAll } from "./toasts";

import Monaco from "@monaco-editor/react";
import useHarmonic from "./language";
import ProgramMeta from "./ProgramMeta";

// The editor tab: either assembly or machine code
enum EditorType {
    ASSEMBLY="ASSEMBLY",
    MACHINE_CODE="MACHINE_CODE"
};
type EditorProps = { setDisableAssemble: (arg: boolean) => void };

/**
 * Code Editor component that support editing and highlighting 
 * of harmonic assembly and machine code.
 * @param props 
 * @param ref, forward ref to expose inner methods to navbar (bad).
 * @returns JSX.Element, the editor component.
 */
const Editor = (props: EditorProps, ref) => {
    const dispatch = useAppDispatch();                              // Type global state dispatch
    const assemblyCode = useRef("");                                // Stores assembly code
    const machineCode = useRef("");                                 // Stores machine code hex
    const [editor, setEditor] = useState(EditorType.ASSEMBLY);      // Stores current editor tab
    const editorRef = useRef(null);                                 // Editor ref to load monaco instance and reference text
    const languageID = useHarmonic();                               // Language hook to use my syntax highlighting :)

    /**
     * Saves the current assembly code to state
     */
    const saveAssembly = () => assemblyCode.current = editorRef.current.getValue();

    /**
     * Replace \r\n with \n for comment parsing since regex is hard
     * @param text string, the text to format.
     * @returns string, the formatted text.
     */
    const format = (text: string): string => text.replace(/(?:\r\n|\r|\n)/g, '\n'); 

    /**
     * Sets editor tab status and disables "assemble" instruction if editing machine code.
     * Loading doesn't cause errors while writing assembly
     * @param type EditorType, the current tab to set.
     */
    const setEditorWrapped = (type: EditorType) => {
        props.setDisableAssemble(type == EditorType.MACHINE_CODE);
        setEditor(type);
    }

    /**
     * Parses the current assembly code and generates the corresponding machine code.
     * @param base number, the base pointer at assemble time (presumably where this will be loaded).
     *                     This is used to index the program meta.
     * @param reset boolean, false if we're adding to the previous memory state. False otherwise.
     */
    const generateMachineCode = (base: number, reset: boolean) => {
        dismissAll();       // Dismiss toasts
        saveAssembly();     // Save the current written code

        let assembled: number[], parsedInstructions: any[];
        // Attempt to acquire parsed machine code
        try {
            // Display success toast on success
            ({ assembled, parsedInstructions } = assemble(format(assemblyCode.current.trim() + "\n")));
            toastSuccess("Successful Assembly!");
        } catch (e) {
            // Display error on failure
            toastError(e.message);
            return;
        }

        // If we succeed, format the machine code as a series 
        // of hex bytes to display in the editor
        machineCode.current = assembled.reduce((code, byte, _) => {
            code += `0x${byte.toString(16).padStart(2, "0")}` + " ";
            return code;
        }, "");

        dispatch(setMeta({meta: parsedInstructions, base, reset}));     // Update the program meta, indexed by assemble-time base
        setEditorWrapped(EditorType.MACHINE_CODE);                      // Switch to machine code editor tab
    }

    /**
     * Loads the binary machine code into the vm following the specified base address.
     * @param base number, the address to begin loading at.
     * @param reset boolean, false if we're adding to the previous memory state. False otherwise.
     */
    const loadBinary = (base: number, reset: boolean) =>{ 
        const binaryBuffer = machineCode.current.split(" ").map(byte => parseInt(byte, 16));
        dispatch(initMachine({program: binaryBuffer, base, reset}));
    }

    // Forward generate and load methods so they can be referenced from the nav 
    // (not best practice - should be defined outside).
    useImperativeHandle(ref, () => ({
        generateMachineCode (base: number, reset: boolean) {
            generateMachineCode(base, reset);
        },
        loadBinary (base: number, reset: boolean) {
            loadBinary(base, reset);
        }
    }), []);

    // Wait until harmonic definition is loaded.
    if (!languageID) { return null; }

    // Set the ref on editor mount.
    const handleEditorDidMount = (editor, _) => {
        editorRef.current = editor;
    }

    return (
        <>
        <ToastContainer />
        <div className="tab-area">
            <button className={(editor === EditorType.ASSEMBLY) ? "editor-tab active" : "editor-tab"} onClick={() => setEditorWrapped(EditorType.ASSEMBLY)}>Assembly</button>
            <button disabled={!machineCode.current} className={(editor === EditorType.MACHINE_CODE) ? "editor-tab active" : "editor-tab"} onClick={() => setEditorWrapped(EditorType.MACHINE_CODE)}>Loader</button>
        </div>
        <div className="editor">
            <Monaco 
                height={(editor === EditorType.ASSEMBLY) ? "80%" : "50%"}
                value={(editor === EditorType.ASSEMBLY) ? assemblyCode.current : machineCode.current}
                onChange={ saveAssembly }
                language={ languageID }
                onMount={ handleEditorDidMount }
                options={{"fontSize": 15, "mouseWheelZoom": true}}
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
