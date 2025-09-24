import '@/styles/globals.css';

import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Metadata } from 'next';
import { Bai_Jamjuree, Inter } from 'next/font/google';
import React from 'react';

import GitHubButton from '@/components/common/GitHubButton/GitHubButton';
import theme from '@/modules/theme';

import { SharedStateProvider } from './SharedStateProvider';
import QueryProvider from './QueryProvider';
import { fetchLatestSemester } from '@/modules/fetchSections2';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-main',
});

const baiJamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const latestSemester = await fetchLatestSemester();
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <GoogleAnalytics gaId="G-CC86XR1562" />
      )}
      <body
        className={`bg-white dark:bg-black ${inter.variable} font-main ${baiJamjuree.variable} text-haiti dark:text-white`}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <QueryProvider>
              <SharedStateProvider latestSemester={latestSemester}>
                {children}
              </SharedStateProvider>
            </QueryProvider>
            <GitHubButton />
            <SpeedInsights />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
