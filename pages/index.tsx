import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import Filters from '../components/common/Filters/filters';
import SearchBar from '../components/common/SearchBar/searchBar';
import SearchQuery from '../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../modules/searchQueryLabel/searchQueryLabel';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const router = useRouter();
  function searchOptionChosen(chosenOption: SearchQuery[]) {
    console.log('The option chosen was: ', chosenOption);
    router.push({
      pathname: '/dashboard',
      query: {
        searchTerms: chosenOption.map((el) => searchQueryLabel(el)).join(','),
      },
    });
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
      <div className="bg-[linear-gradient(rgba(255,255,255,0.6),rgba(255,255,255,0.6)),url('/background.png')] dark:bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('/background.png')] bg-cover h-full w-full flex justify-center items-center p-8">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold mb-3 text-cornflower-600 dark:text-cornflower-400 tracking-wider">
            POWERED BY{' '}
            <a
              href="https://www.utdnebula.com/"
              target="_blank"
              className="underline decoration-transparent hover:decoration-inherit transition"
              rel="noreferrer"
            >
              NEBULA LABS
            </a>
          </h2>
          <h1 className="text-6xl font-extrabold font-kallisto mb-6">
            UTD TRENDS
          </h1>
          <p className="mb-10 text-gray-700 dark:text-gray-300 leading-7">
            Explore and compare past grades, professor ratings, and reviews to
            find the perfect class.
          </p>
          <SearchBar
            selectValue={searchOptionChosen}
            className="mb-3"
            input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
          />
          <Filters />
        </div>
      </div>
    </>
  );
};

export default Home;
