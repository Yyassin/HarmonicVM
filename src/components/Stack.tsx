import React from "react";
import { spSelector } from "../reducers/memoryReducer";
import { useAppSelector } from "../store";
import MainMemory from "./Memory";

const Stack = () => {
    const sp = useAppSelector(spSelector);
    return <MainMemory end={sp + 2} tableCaption="Stack"/>
}

export default Stack;