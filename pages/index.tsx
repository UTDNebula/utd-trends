import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Card from '@mui/material/Card';
import { SplashPageSearchBar } from '../components/common/SplashPageSearchBar/splashPageSearchBar';
import { WaveSVG } from '../components/icons/Wave/waveSVG';
import { Wave2SVG } from '../components/icons/Wave2/wave2SVG';
import { LogoIcon } from '../components/icons/LogoIcon/logoIcon';
import { useState } from 'react';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};
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
        query: { searchTerms: searchTermURIString(chosenOption) },
      },
      '/dashboard',
    );
  }

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
              <div className="bottom-0 absolute text-dark w-full h-1/4 m-auto pb-12 mt-4 mb-4">
                <SplashPageSearchBar
                  selectSearchValue={searchOptionChosen}
                  disabled={false}
                />
              </div>
              <div className="w-11/12 h-3/4 m-auto -translate-y-1/2 relative">
                <Card className="bg-primary rounded-xl drop-shadow-lg text-light p-8 relative h-full">
                  <div className="m-auto  w-1/5">
                    <LogoIcon />
                  </div>
                  <div className="text-center pb-2">
                    <h2 className="text-headline4 text-light-always">Welcome to UTD Trends!</h2>
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

function searchTermURIString(query: SearchQuery): string {
  let result = '';
  if (query.prefix !== undefined) {
    result += query.prefix;
  }
  if (query.number !== undefined) {
    result += ' ' + query.number;
  }
  if (query.sectionNumber !== undefined) {
    result += '.' + query.sectionNumber;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  return result.trim();
}

export default Home;
