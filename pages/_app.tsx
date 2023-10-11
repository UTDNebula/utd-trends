import '../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>UTD Trends</title>
        <link rel="icon" href="/Project_Nebula_Logo.svg" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
