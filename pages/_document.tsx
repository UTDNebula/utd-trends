import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

function Document() {
  return (
    <Html>
      <Head prefix="og: http://ogp.me/ns#">
        <meta
          name="description"
          content="A data visualization tool built to help students view historical course and section data."
        />
        <meta name="theme-color" content="#573dff" />

        <meta property="og:title" content="UTD Trends" />
        <meta
          property="og:description"
          content="A data visualization tool built to help students view historical course and section data."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://trends.utdnebula.com/Project_Nebula_Logo.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="Nebula Labs Icon." />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:domain" content="trends.utdnebula.com" />
      </Head>
      <body className="font-inter">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
