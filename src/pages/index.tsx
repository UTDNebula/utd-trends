import BookIcon from '@mui/icons-material/Book';
import {
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Background from '@/../public/background.png';
import SearchBar from '@/components/search/SearchBar/SearchBar';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
const Home: NextPage = () => {
  const router = useRouter();

  const [results, setResults] = useState<GenericFetchedData<SearchQuery[]>>({
    state: 'done',
    data: [],
  }); // essentially a dummy state. Used only for the loading animation to start in home screen before navigation to the dashboard
  const [filterNextSem, setFilterNextSem] = useState('true');

  async function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      await router.push({
        pathname: '/dashboard',
        query: {
          searchTerms: chosenOptions
            .map((el) => searchQueryLabel(el))
            .join(','),
          availability: filterNextSem,
        },
      });
    }
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
      <div className="relative bg-lighten dark:bg-darken h-full w-full flex flex-col items-center gap-4 px-8 py-4">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
        />
        <Link href="/planner" className="absolute top-4 right-4 rounded-xl">
          <Button className="bg-cornflower-500 rounded-xl text-white dark:bg-cornflower-400 text p-2 px-4 normal-case">
            <BookIcon className="mr-2" />
            My Planner
          </Button>
        </Link>
        <div className="max-w-xl grow flex flex-col justify-center">
          <h2 className="text-sm font-semibold mb-3 text-cornflower-600 dark:text-cornflower-400 tracking-wider">
            POWERED BY {/*eslint-disable-next-line react/jsx-no-target-blank*/}
            <a
              href="https://www.utdnebula.com/"
              target="_blank"
              rel="noopener"
              className="underline decoration-transparent hover:decoration-inherit transition"
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
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
            onSelect={searchOptionChosen}
            resultsLoading={results.state}
            setResultsLoading={() => setResults({ state: 'loading' })}
            input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
          />
          {/* Teaching Next Semester switch*/}
          <Tooltip title="Select Availability" placement="bottom-start">
            <FormControl
              size="small"
              className={`min-w-max flex-row items-center ${
                filterNextSem == 'true'
                  ? '[&>.MuiInputBase-root]:bg-cornflower-50 [&>.MuiInputBase-root]:dark:bg-cornflower-900'
                  : '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-black'
              }`}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={filterNextSem == 'true'}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setFilterNextSem(event.target.checked ? 'true' : 'false');
                    }}
                  />
                }
                label="Teaching Next Semester"
              />
            </FormControl>
          </Tooltip>
        </div>
      </div>
    </>
  );
};

export default Home;
