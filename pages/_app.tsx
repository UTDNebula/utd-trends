import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { IconButton, Card } from '@mui/material';
import GitHub from '@mui/icons-material/GitHub';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';

function MyApp({ Component, pageProps }: AppProps) {
  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkModeElevation = prefersDarkMode ? 3 : 1;

  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link rel="icon" href="/Project_Nebula_Logo.svg" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      {showGitInfo || true ? (
        <>
          <Card
            className="w-fit h-fit bg-light fixed bottom-2 right-2 rounded-full"
            elevation={darkModeElevation}
          >
            <a
              href={
                'https://github.com/UTDNebula/utd-trends/commit/' +
                process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconButton
                size="large"
                onClick={() => {
                  setGitInfoOpen(true);
                }}
              >
                <GitHub className="fill-dark text-3xl" />
              </IconButton>
            </a>
          </Card>
        </>
      ) : null}
    </>
  );
}

export default MyApp;
