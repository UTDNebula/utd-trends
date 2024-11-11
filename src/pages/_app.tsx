
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../styles/globals.css';  

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = Cookies.get('theme');
    return savedTheme === 'dark';
  });

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      Cookies.set('theme', newMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <Head>
        <title>UTD Trends</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div>
        <button
          onClick={toggleDarkMode}
          style={{
            padding: '10px 20px',
            backgroundColor: '#00FF00',
            color: '#000',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '20px',
          }}
        >
          Toggle
        </button>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
};

export default MyApp;
