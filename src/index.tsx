import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from "./store";
import { ChakraProvider, ColorModeScript, ThemeProvider } from "@chakra-ui/react";
import theme from "./components/theme/theme";

import App from './App';

ReactDOM.render(
  <ChakraProvider>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </Provider>
    </ThemeProvider>
  </ChakraProvider>,
  document.getElementById('root')
);

