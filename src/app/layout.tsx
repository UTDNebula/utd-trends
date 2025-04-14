import '@/styles/globals.css';

import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import React from 'react';

import { SharedStateProvider } from './SharedStateProvider';
import FeedbackPopup from '@/components/common/FeedbackPopup/FeedbackPopup';
import GitHubButton from '@/components/common/GitHubButton/GitHubButton';
import theme from '@/modules/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
const kallisto = localFont({
  src: [
    /*
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
    */
    {
      path: '../fonts/Kallisto/Kallisto Bold.otf',
      weight: '700',
      style: 'normal',
    },
    /*
    {
      path: '../fonts/Kallisto/Kallisto Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
    */
    {
      path: '../fonts/Kallisto/Kallisto Heavy.otf',
      weight: '900',
      style: 'normal',
    },
    /*
    {
      path: '../fonts/Kallisto/Kallisto Heavy Italic.otf',
      weight: '900',
      style: 'italic',
    },
    */
  ],
  variable: '--font-kallisto',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trends.utdnebula.com'),
  title: {
    template: '%s - UTD TRENDS',
    default: 'UTD TRENDS',
  },
  description:
    "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data.",
  openGraph: {
    title: 'UTD TRENDS',
    description:
      "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};

export const viewport = {
  //copied from globals.css
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#573dff' },
    { media: '(prefers-color-scheme: dark)', color: '#a297fd' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-CC86XR1562" />
      <body
        className={`bg-white dark:bg-black ${inter.variable} font-inter ${kallisto.variable} text-haiti dark:text-white`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <SharedStateProvider>{children}</SharedStateProvider>
            <FeedbackPopup />
            <GitHubButton />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
