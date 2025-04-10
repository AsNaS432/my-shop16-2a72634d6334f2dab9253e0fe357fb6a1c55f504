import React, { createContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'dark' && {
        background: {
          default: '#121212', // Dark background
          paper: '#1E1E1E', // Dark paper background
        },
        text: {
          primary: '#FFFFFF', // White text for dark mode
          secondary: '#B0BEC5', // Light grey for secondary text
        },
      }),
    },
  });

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
