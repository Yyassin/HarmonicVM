import React from "react";
import { Box, Text } from "@chakra-ui/react";

/**
 * Linear Gradient Harmonic Logo
 */
const Logo = (props: any) => (
    <Box { ...props }>
        <Text
            bgGradient="linear(to-l, blue.200, teal.500)"
            bgClip="text"
            fontSize="20" fontWeight="extrabold"
        >
            Harmonic
        </Text>
    </Box>
);

export default Logo;