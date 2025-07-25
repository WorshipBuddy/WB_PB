import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, MantineProvider } from "@mantine/core";
import App from './App';
import './App.css';

const theme = createTheme({});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);