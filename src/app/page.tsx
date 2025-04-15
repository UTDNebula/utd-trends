'use client';

import BookIcon from '@mui/icons-material/Book';
import {
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Suspense, useState } from 'react';

import Background from '@/../public/background.png';
import SearchBar, {
  LoadingSearchBar,
} from '@/components/search/SearchBar/SearchBar';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
export default function Home() {
  const router = useRouter();

  const [filterNextSem, setFilterNextSem] = useState('true');

  async function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      const searchParams = new URLSearchParams({
        searchTerms: chosenOptions.map(searchQueryLabel).join(','),
        availability: filterNextSem,
      });
      router.push(`/dashboard?${searchParams.toString()}`);
    }
  }

  return (
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
        <Suspense
          fallback={
            <LoadingSearchBar input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti" />
          }
        >
          <SearchBar
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
            onSelect={searchOptionChosen}
            input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
          />
        </Suspense>
        {/* Teaching Next Semester switch*/}
        <Tooltip title="Select Availability" placement="bottom-start">
          <FormControl
            size="small"
            className={`min-w-max flex-row items-center ${
              filterNextSem == 'true'
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
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
  );
}
