import '@/styles/globals.css';
import GitHubButton from '@/components/common/GitHubButton/GitHubButton';
import MobileNavBar from '@/components/navigation/MobileNavBar/MobileNavBar';
import { fetchLatestSemester } from '@/modules/fetchSections';
import theme from '@/modules/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { Metadata } from 'next';
import { Bai_Jamjuree, Inter } from 'next/font/google';
import React, { Suspense } from 'react';
import QueryProvider from './QueryProvider';
import { SharedStateProvider } from './SharedStateProvider';

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
        className={`bg-[rgb(246,246,246)] dark:bg-black ${inter.variable} font-main ${baiJamjuree.variable} text-haiti dark:text-white`}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <QueryProvider>
              <SharedStateProvider latestSemester={latestSemester}>
                <div className="pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
                  {children}
                </div>
                <Suspense fallback={null}>
                  <MobileNavBar />
                </Suspense>
                <ReactQueryDevtools initialIsOpen={false} />
              </SharedStateProvider>
            </QueryProvider>
            <GitHubButton />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
