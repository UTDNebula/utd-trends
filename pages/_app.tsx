import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function MyApp({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const muiTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#7486ce',
      },
    },
  });

  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link rel="icon" href="/Project_Nebula_Logo.svg" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
