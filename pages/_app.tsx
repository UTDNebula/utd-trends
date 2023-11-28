import '../styles/globals.css';

import GitHub from '@mui/icons-material/GitHub';
import {
  Alert,
  Button,
  Card,
  IconButton,
  Rating,
  Snackbar,
  SnackbarContent,
  TextField,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
const kallisto = localFont({
  src: [
    {
      path: '../fonts/Kallisto/Kallisto Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Thin Italic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light Italic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium Italic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Heavy.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Heavy Italic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-kallisto',
});

function MyApp({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    typeof process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== '';
  const darkModeElevation = prefersDarkMode ? 3 : 1;

  const muiTheme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      //copied from tailwind.config.js
      primary: {
        main: '#573dff',
      },
      secondary: {
        main: '#573dff',
        light: '#c2c8ff',
      },
      error: {
        main: '#ff5743',
      },
    },
    typography: {
      fontFamily: 'inherit',
    },
  });

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  useEffect(() => {
    let previousFeedback = localStorage.getItem('feedback');
    if (previousFeedback !== null) {
      previousFeedback = JSON.parse(previousFeedback);
      ///if (previousFeedback.value !== 'closed' && previousFeedback.value !== 'submitted') {
      // eslint-disable-next-line no-constant-condition
      if (true) {
        ///change before prod!!
        const timer = setTimeout(() => {
          setFeedbackOpen(true);
        }, 1000 * 1); //1 second///change before prod!!
        return () => clearTimeout(timer);
      }
    }
  }, []);
  const [feedbackSuccessOpen, setFeedbackSuccessOpen] = useState(false);
  const handleFeedbackSuccessClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedbackSuccessOpen(false);
  };
  const [feedbackErrorOpen, setFeedbackErrorOpen] = useState(false);
  const handlefeedbackErrorClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedbackErrorOpen(false);
  };
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackExtra, setFeedbackExtra] = useState('');
  const cacheIndexFeedback = 0; //Increment this to request feedback from all users on next deployment

  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/logoIcon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <main className={inter.variable + ' ' + kallisto.variable}>
          <Component {...pageProps} />
          <Snackbar open={feedbackOpen}>
            <SnackbarContent
              className="bg-white dark:bg-haiti text-haiti dark:text-white"
              sx={{
                '& .MuiSnackbarContent-message ': {
                  width: '100%',
                },
              }}
              message={
                <div className="flex flex-col items-center gap-2">
                  <p className="text-base self-start">
                    How would you rate your experience with Trends?
                  </p>
                  <Rating
                    value={feedbackRating}
                    size="large"
                    onChange={(event, newValue) => {
                      setFeedbackRating(newValue);
                    }}
                  />
                  {feedbackRating !== null && (
                    <>
                      <p className="text-base self-start">
                        Do you have anything else you&apos;d like to add?
                      </p>
                      <TextField
                        className="w-full"
                        multiline
                        value={feedbackExtra}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                          setFeedbackExtra(event.target.value);
                        }}
                      />
                      <p className="text-xs">
                        Visit our{' '}
                        <a
                          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                          href="https://github.com/UTDNebula/utd-trends"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          GitHub
                        </a>{' '}
                        for more detailed issue reporting.
                      </p>
                    </>
                  )}
                  <div className="self-end flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setFeedbackOpen(false);
                        localStorage.setItem(
                          'feedback',
                          JSON.stringify({
                            value: 'closed',
                            cacheIndex: cacheIndexFeedback,
                          }),
                        );
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="[&:not(:hover):not(:disabled)]:bg-royal"
                      size="small"
                      variant="contained"
                      disabled={feedbackRating === null}
                      onClick={() => {
                        setFeedbackOpen(false);
                        fetch('https://catfact.ninja/fact', { method: 'GET' })
                          .then((response) => response.json())
                          .then((data) => {
                            /*if (data.message !== 'success') {
                            throw new Error(data.message);
                          }*/
                            setFeedbackSuccessOpen(true);
                            console.log(data, feedbackRating, feedbackExtra);
                            localStorage.setItem(
                              'feedback',
                              JSON.stringify({
                                value: 'submitted',
                                cacheIndex: cacheIndexFeedback,
                              }),
                            );
                          })
                          .catch((error) => {
                            setFeedbackErrorOpen(true);
                            localStorage.setItem(
                              'feedback',
                              JSON.stringify({
                                value: 'error',
                                cacheIndex: cacheIndexFeedback,
                              }),
                            );
                            console.error('Feedback', error);
                          });
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              }
            />
          </Snackbar>
          <Snackbar
            open={feedbackSuccessOpen}
            autoHideDuration={6000}
            onClose={handleFeedbackSuccessClose}
          >
            <Alert
              onClose={handleFeedbackSuccessClose}
              severity="success"
              sx={{ width: '100%' }}
            >
              Feedback submitted. Thank you!
            </Alert>
          </Snackbar>
          <Snackbar
            open={feedbackErrorOpen}
            autoHideDuration={6000}
            onClose={handlefeedbackErrorClose}
          >
            <Alert
              onClose={handlefeedbackErrorClose}
              severity="error"
              sx={{ width: '100%' }}
            >
              There was an error submitting your response. Please try again
              later.
            </Alert>
          </Snackbar>
        </main>
      </ThemeProvider>
      <Analytics />
      {showGitInfo ? (
        <>
          <Card
            className="w-fit h-fit bg-light fixed bottom-2 right-2 rounded-full"
            elevation={darkModeElevation}
          >
            <Tooltip title="Open GitHub commit for this instance">
              <a
                href={
                  'https://github.com/UTDNebula/utd-trends/commit/' +
                  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                <IconButton size="large">
                  <GitHub className="fill-dark text-3xl" />
                </IconButton>
              </a>
            </Tooltip>
          </Card>
        </>
      ) : null}
    </>
  );
}

export default MyApp;
