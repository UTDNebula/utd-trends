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
import { WaveSVG } from '../components/icons/Wave/waveSVG';
import { Wave2SVG } from '../components/icons/Wave2/wave2SVG';
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
  function searchOptionChosen(chosenOption: SearchQuery) {
    //console.log('The option chosen was: ', chosenOption);
    router.push(
      {
        pathname: '/dashboard',
        query: { searchTerms: searchQueryLabel(chosenOption) },
      },
      '/dashboard',
    );
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
      <div className="w-full justify-center items-center bg-gradient-to-b from-primary to-light text-primary-darker ">
        <div className="w-full h-2/3 absolute translate-y-1/4 overflow-x-hidden overflow-hidden">
          <WaveSVG />
        </div>
        <div className="w-full h-2/3 absolute translate-y-1/3 overflow-x-hidden overflow-hidden">
          <Wave2SVG />
        </div>
        <div className="flex justify-center content-center h-screen translate-y-">
          <div className="h-1/4 w-full relative m-auto">
            <Card className="bg-light relative sm:w-5/12 overflow-visible drop-shadow-lg rounded-xl bg-opacity-50 m-auto xs:w-11/12">
              <div className="bottom-0 absolute text-dark w-full h-1/4 m-auto pb-12 mt-4 mb-6">
                <SplashPageSearchBar
                  selectSearchValue={searchOptionChosen}
                  disabled={false}
                />
                <TransparentTooltip
                  title={
                    <Card className="px-3 py-2" elevation={1}>
                      <Typography variant="body2">
                        You can search for:
                        <ul className="list-disc list-inside my-1">
                          <li>
                            A whole course:{' '}
                            <span className="italic">CS 1337</span>
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
                        <p>
                          then we&apos;ll aggregate grades across every section
                        </p>
                      </Typography>
                    </Card>
                  }
                >
                  <Typography
                    className="text-gray-600"
                    align="center"
                    variant="subtitle2"
                  >
                    What you can enter?{' '}
                    <span className="underline">Pretty much anything.</span>
                  </Typography>
                </TransparentTooltip>
              </div>
              <div className="w-11/12 h-3/4 m-auto -translate-y-1/2 relative">
                <Card className="bg-primary rounded-xl drop-shadow-lg text-light p-8 relative h-full">
                  <div className="m-auto  w-1/5">
                    <LogoIcon />
                  </div>
                  <div className="text-center pb-2">
                    <h2 className="text-headline4 text-light-always">
                      Welcome to UTD Trends!
                    </h2>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
