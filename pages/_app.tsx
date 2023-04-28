import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Box, IconButton, Card, Modal, Fade } from '@mui/material';
import GitHub from '@mui/icons-material/GitHub';
import { useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  const [gitInfoOpen, setGitInfoOpen] = useState<boolean>(false);
  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  console.log(
    process.env.NEXT_PUBLIC_SHA,
    process.env.NEXT_PUBLIC_VERCEL_ENV,
  );

  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link rel="icon" href="/Project_Nebula_Logo.svg" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
      {showGitInfo ? (
        <>
          <Box className="w-fit h-fit bg-light fixed bottom-2 right-2 rounded-full">
            <IconButton
              size="large"
              onClick={() => {
                setGitInfoOpen(true);
              }}
            >
              <GitHub className="fill-dark text-3xl" />
            </IconButton>
          </Box>
          <Modal
            open={gitInfoOpen}
            onClose={() => setGitInfoOpen(false)}
            className="flex justify-center align-center"
          >
            <Fade in={gitInfoOpen}>
              <Card className="p-4 m-12 h-fit">
                <a
                  href={
                    'https://github.com/UTDNebula/utd-trends/commit/' +
                    process.env.NEXT_PUBLIC_SHA
                  }
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {process.env.NEXT_PUBLIC_SHA?.substring(0, 7)}
                </a>
              </Card>
            </Fade>
          </Modal>
        </>
      ) : null}
    </>
  );
}

export default MyApp;
