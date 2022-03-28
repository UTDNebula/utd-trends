import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { Component } from 'react';

type ComponentWithLayout = AppProps &{
  Component:AppProps["Component"] &{
    PageLayout?:React.ComponentType
  }
}

function MyApp({ Component, pageProps }: ComponentWithLayout) {
  return (
    <>
      <Head>
        <title>Athena</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {
        Component.PageLayout ? (
          <Component.PageLayout>
            <Component {...pageProps} />
          </Component.PageLayout>
          
        ) : (
          <Component {...pageProps} />
        )
      }
      
    </>
  );
}

export default MyApp;
