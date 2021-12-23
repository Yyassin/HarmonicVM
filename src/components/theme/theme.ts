import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
    initialColorMode: "dark",
    useSystemColorMode: true
}

const theme = extendTheme({ config });
console.log(theme)
export default theme;