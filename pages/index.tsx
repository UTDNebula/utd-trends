import { Tooltip, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { SplashPageSearchBar } from '../components/common/SplashPageSearchBar/splashPageSearchBar';
import { LogoIcon } from '../components/icons/LogoIcon/logoIcon';
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
      <div className="bg-[url('/background.png')] bg-cover h-full w-full flex justify-center items-center">
        <div>
          <h2 className="text-sm font-semibold mb-3">
            POWERED BY NEBULA LABS
          </h2>
          <h1 className="text-6xl font-extrabold font-kallisto mb-6">
            UTD TRENDS
          </h1>
          <p className="mb-10">
            Explore and compare past grades, syllabi, professor ratings and reviews to find the perfect class. 
          </p>
          <SplashPageSearchBar
            selectSearchValue={searchOptionChosen}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
