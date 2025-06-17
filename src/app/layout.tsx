import '@/styles/globals.css';

import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Metadata } from 'next';
import React from 'react';

import FeedbackPopup from '@/components/common/FeedbackPopup/FeedbackPopup';
import GitHubButton from '@/components/common/GitHubButton/GitHubButton';
import theme from '@/modules/theme';

import { SharedStateProvider } from './SharedStateProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://trends.utdnebula.com'),
  title: {
    template: '%s - UTD TRENDS',
    default: 'UTD TRENDS',
  },
  description:
    "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data.",
  keywords: [
    'UT Dallas',
    'schedule',
    'planner',
    'grades',
    'Rate My Professors',
  ],
  openGraph: {
    title: 'UTD TRENDS',
    description:
      "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with grade and Rate My Professors data.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
  other: {
    'geo.region': 'US-TX',
    'geo.placename': 'Richardson',
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
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <GoogleAnalytics gaId="G-CC86XR1562" />
      )}
      <body className="bg-white dark:bg-black font-inter text-haiti dark:text-white">
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <SharedStateProvider>{children}</SharedStateProvider>
            <FeedbackPopup />
            <GitHubButton />
            <SpeedInsights />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
