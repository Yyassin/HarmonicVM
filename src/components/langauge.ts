import { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { InstructionMnemonic } from "../harmonic/src/cpu/instructions";

export default function useHarmonic() {
    const monaco = useMonaco();
    const [languageID, setLanguageID] = useState("");

    // Set instructions as keywords in both cases
    const keywords = Object.values(InstructionMnemonic)
        .filter(value => typeof value === "string")
        .reduce((arr, keyword) => {
            arr.push(keyword);
            arr.push(keyword.toUpperCase());
            return arr;
        }, []);

    const regs = /(r0|R0|r1|R1|r2|R2|r3|R3|r4|R4|r5|R5|r6|R6|r7|R7|acc|ACC|mb|MB|im|IM|sp|SP|fp|FP|pc|PC)/;

    useEffect(() => {
        if (!monaco) { return; }

        const languageID = "harmonic";
        setLanguageID(languageID);

        monaco.languages.register({ id: languageID });
        monaco.languages.setMonarchTokensProvider("harmonic",{
            defaultToken: "invalid",
            keywords,
            typeKeywords: ['constant', 'data8', 'data16', 'structure'],
            operators: ['+', "-", "/", "*", "!"],
            
            // Common regular expressions
            symbols:  /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
            tokenizer: {
                root: [
                    [regs, "number.register"],
                    [/\$(@hexdigits)/, 'string.invalid'],
                    [/\&(@hexdigits)/, 'number.addr'],

                    // identifiers and keywords
                    [/[a-z_$][\w$]*/, { 
                        cases: { '@typeKeywords': 'keyword',
                                   '@keywords': 'keyword',
                                   '@default': 'identifier' } 
                    }],
                    // whitespace
                    { include: '@whitespace' },
                    [/[A-Z][\w\$]*/, 'type.identifier' ],      
                    [/\!\s*[a-zA-Z_\$][\w\$]*/, { token: 'annotation', log: 'annotation token: $0' }],

                    [/\[(.*)\]/, "type.identifier"],            

                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],

                    // numbers
                    [/\[(.*?)\]/, 'number.literal']
                ],
                whitespace: [
                    [/[ \t\r\n]+/, ''],
                    [/(^;.*$)/, 'comment']
                ]
            }
        }); 
    }, [monaco]);

    if (languageID !== "") {
        return languageID;
    }
}