import React from "react";
import { spSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";
import MainMemory from "./Memory";

/**
 * A view for the stack. Same as memory view but using
 * a different pointer.
 */
const Stack = () => {
    const sp = useAppSelector(spSelector);
    return <MainMemory end={sp + 2} tableCaption="Stack"/>
}

export default Stack;