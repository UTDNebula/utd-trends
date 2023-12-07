import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { SplashPageSearchBar } from '../components/common/SplashPageSearchBar/splashPageSearchBar';
import SearchQuery from '../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../modules/searchQueryLabel/searchQueryLabel';

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

  const [searchBy, setSearchBy] = useState('any');
  const [ABTest, setABTest] = useState(true);

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
      <button
        onClick={() => setABTest((old) => !old)}
        className="absolute top-0 left-0"
      >
        Toggle A/B Test
      </button>
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
            Explore and compare past grades, syllabi, professor ratings and
            reviews to find the perfect class.
          </p>
          {ABTest && (
            <div className="flex gap-2 mb-3">
              <FormControl
                size="small"
                className="rounded-md border-gray-300 dark:border-gray-700 border-2 w-32 bg-white dark:bg-haiti text-sm"
              >
                <InputLabel id="search-by-label" className="pt-2">
                  Search by
                </InputLabel>
                <Select
                  labelId="search-by-label"
                  value={searchBy}
                  label="Search by"
                  onChange={(event) =>
                    setSearchBy(event.target.value as string)
                  }
                  className="pt-2"
                  sx={{
                    '.MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                    },
                  }}
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                  <MenuItem value="course">Course</MenuItem>
                </Select>
              </FormControl>
              <SplashPageSearchBar
                selectSearchValue={searchOptionChosen}
                className="grow"
                searchBy={searchBy}
              />
            </div>
          )}
          {!ABTest && (
            <SplashPageSearchBar
              selectSearchValue={searchOptionChosen}
              className="mb-3"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
