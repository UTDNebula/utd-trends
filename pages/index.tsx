import { Alert } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Filters, {
  type FiltersType,
} from '../components/common/Filters/filters';
import SearchBar from '../components/common/SearchBar/searchBar';
import SearchQuery from '../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../modules/searchQueryLabel/searchQueryLabel';
import Background from '../public/background.png';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const [errorMessage, setErrorMessage] = useState(false);
  function searchOptionsChange(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      setErrorMessage(false);
    }
  }

  const [filters, setFilters] = useState<FiltersType>({});

  const router = useRouter();
  function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      router.push({
        pathname: '/dashboard',
        query: {
          ...filters,
          searchTerms: chosenOptions
            .map((el) => searchQueryLabel(el))
            .join(','),
        },
      });
    } else {
      setErrorMessage(true);
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
      <div className="relative bg-lighten dark:bg-darken h-full w-full flex justify-center items-center p-8">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
        />
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
          {errorMessage && (
            <Alert severity="error" className="mb-2">
              Select an option before searching.
            </Alert>
          )}
          <SearchBar
            onSelect={searchOptionChosen}
            onChange={searchOptionsChange}
            className="mb-3"
            input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
          />
          <Filters changeValue={(value) => setFilters(value)} />
        </div>
      </div>
    </>
  );
};

export default Home;
