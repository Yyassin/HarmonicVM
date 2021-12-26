import React from "react";
import { Link, Box, Flex, Text, Button, Stack, useColorMode, Input, FormLabel, Checkbox } from "@chakra-ui/react";

import Logo from "./Logo";
import SpeedSlider from "./SpeedSlider";

const NavBar = (props) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavBarContainer {...props}>
      <Logo/>
      <MenuToggle toggle={toggle} isOpen={isOpen} />
      <MenuLinks {...props} isOpen={isOpen} />
    </NavBarContainer>
  );
};

const CloseIcon = () => (
  <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <title>Close</title>
    <path
      fill="white"
      d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24px"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill="white"
  >
    <title>Menu</title>
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
  </svg>
);

const MenuToggle = ({ toggle, isOpen }) => {
  return (
    <Box display={{ base: "block", md: "none" }} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </Box>
  );
};

const MenuItem = ({ children, to = "/", ...rest }) => {
  return (
    <Link href={to}>
      <Text display="block" {...rest}>
        {children}
      </Text>
    </Link>
  );
};

const MenuAButton = ({ children, to = "/", ...rest }) => {
  return (
      <Text cursor="pointer" display="block" {...rest}>
        {children}
      </Text>
  );
};

const MenuLinks = ({ isOpen, handleAssemble, handleLoadBinary, handleStep, handleRun, handleRunSpeed, disabledAssemble, running }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const baseAddr = React.useRef(0);
  const fresh = React.useRef(false);

  return (
    <Box
      display={{ base: isOpen ? "block" : "none", md: "block" }}
      flexBasis={{ base: "100%", md: "auto" }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={["center", "space-between", "flex-end", "flex-end"]}
        direction={["column", "column", "row", "row"]}
        pt={[4, 4, 0, 0]}
      >
        <MenuAButton 
          color={disabledAssemble ? "grey" : "inherit"}
          _hover={{
            color: disabledAssemble ? "grey" : "teal.500",
            cursor: disabledAssemble ? "default" : "pointer",
            transition: "100ms ease"
          }} 
          onClick={() => !disabledAssemble && handleAssemble(baseAddr.current, fresh.current)}> Assemble </MenuAButton>
        <FormLabel 
          htmlFor='load' 
          _hover={{
            color: "teal.500",
            transition: "100ms ease",
            cursor: "pointer"
          }} 
          onClick={() => handleLoadBinary(baseAddr.current, fresh.current)}
        >
          Load
        </FormLabel>
        <Checkbox
          onChange={e => fresh.current = e.target.checked}
        >
          Fresh?
        </Checkbox>
        <Input 
            id="load"
            defaultValue={"0000"}
            color={"blue.600"}
            fontWeight={"bold"} 
            maxLength={4} 
            height={"30px"}
            width={"60px"}
            fontSize={"18px"} 
            padding={"5px"}
            onChange={event => baseAddr.current = parseInt(event.target.value, 16)}
        ></Input>
        <MenuAButton 
          _hover={{
            color: "teal.500",
            transition: "100ms ease"
          }} 
          onClick={handleStep}> Step </MenuAButton>
          
        <SpeedSlider open={isOpen} onChange={(value) => handleRunSpeed(value)}></SpeedSlider>
        <MenuAButton>
          <Button
            size="sm"
            rounded="md"
            color={["white", "white", "white", "white"]}
            bg={["blue.600", "blue.600", "blue.600", "blue.600"]}
            _hover={{
              bg: ["teal.500", "teal.500", "teal.500", "teal.500"]
            }}
            onClick={handleRun}
          >
            { running ? "Stop" : "Run" }
          </Button>
        </MenuAButton>
        <MenuAButton>
          <Button
            size="sm"
            rounded="md"
            color={["white", "white", "white", "white«"]}
            bg={["blue.600", "blue.600", "blue.600", "blue.600"]}
            _hover={{
              bg: ["teal.500", "teal.500", "teal.500", "teal.500"]
            }}
            onClick={toggleColorMode}
          >
            Toggle {colorMode === "light" ? "Dark" : "Light"}
          </Button>
        </MenuAButton>
      </Stack>
    </Box>
  );
};

const NavBarContainer = ({ children, ...props }) => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      p={8}
      bg="#243447"
      color="white"
      {...props}
    >
      {children}
    </Flex>
  );
};

export default NavBar;