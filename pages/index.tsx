import { Card, Tooltip, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { SplashPageSearchBar } from '../components/common/SplashPageSearchBar/splashPageSearchBar';
import SearchQuery from '../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../modules/searchQueryLabel/searchQueryLabel';

const TransparentTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'transparent',
    maxWidth: 'none',
  },
}));

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const router = useRouter();
  function searchOptionChosen(chosenOption: SearchQuery | null) {
    //console.log('The option chosen was: ', chosenOption);
    if (chosenOption !== null) {
      router.push(
        {
          pathname: '/dashboard',
          query: { searchTerms: searchQueryLabel(chosenOption) },
        },
        '/dashboard',
      );
    }
  }

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const cardElevation = prefersDarkMode ? 3 : 1;

  return (
    <>
      <Head>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com"
          key="canonical"
        />
        <meta property="og:url" content="https://trends.utdnebula.com" />
      </Head>
      <div className="bg-[linear-gradient(rgba(211,211,211,0.5),rgba(211,211,211,0.5)),url('/background.png')] dark:bg-[linear-gradient(rgba(45,45,45,0.5),rgba(45,45,45,0.5)),url('/background.png')] bg-cover h-full w-full flex justify-center items-center p-8">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold mb-3 text-cornflower-600 dark:text-cornflower-400 tracking-wider">
            POWERED BY NEBULA LABS
          </h2>
          <h1 className="text-6xl font-extrabold font-kallisto mb-6">
            UTD TRENDS
          </h1>
          <p className="mb-10 text-gray-700 dark:text-gray-300 leading-7">
            Explore and compare past grades, syllabi, professor ratings and
            reviews to find the perfect class.
          </p>
          <SplashPageSearchBar
            selectSearchValue={searchOptionChosen}
            className="mb-3"
          />
          <TransparentTooltip
            title={
              <Card className="px-3 py-2" elevation={cardElevation}>
                <p className="text-sm">
                  You can search for:
                  <ul className="list-disc list-inside my-1">
                    <li>
                      A whole course: <span className="italic">CS 1337</span>
                    </li>
                    <li>
                      A professor&apos;s name:{' '}
                      <span className="italic">Jason Smith</span>
                    </li>
                    <li>
                      A course and professor:{' '}
                      <span className="italic">CS 1337 Jason Smith</span>
                    </li>
                  </ul>
                  then we&apos;ll aggregate grades across every section
                </p>
              </Card>
            }
            enterTouchDelay={0}
          >
            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              What can you enter?{' '}
              <span className="underline">Pretty much anything.</span>
            </p>
          </TransparentTooltip>
        </div>
      </div>
    </>
  );
};

export default Home;
