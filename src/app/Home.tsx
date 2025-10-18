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
import React, { useState, useTransition } from 'react';

import Background from '@/../public/background.png';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import SearchBar, {
  updateRecentSearches,
} from '@/components/search/SearchBar/SearchBar';
import { displaySemesterName } from '@/modules/semesters';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

interface Props {
  latestSemester: GenericFetchedData<string>;
}

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
export default function Home(props: Props) {
  const router = useRouter();

  //for spinner after router.push
  const [isPending, startTransition] = useTransition();

  const [filterNextSem, setFilterNextSem] = useState('true');

  async function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      const searchParams = new URLSearchParams({
        searchTerms: chosenOptions.map(searchQueryLabel).join(','),
        availability: filterNextSem,
      });
      startTransition(() => {
        router.push(`/dashboard?${searchParams.toString()}`);
      });
      // add to recent searches
      const chosenRecentOptions = chosenOptions.map((option) => ({
        ...option,
        isRecent: true,
      }));
      updateRecentSearches(chosenRecentOptions);
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
      <div className="absolute top-4 left-4 right-4 flex gap-2 place-content-between flex-wrap-reverse">
        {/*Ad for Kickoff*/}
        {/*<a
          href="https://discord.utdnebula.com/"
          target="_blank"
          rel="noreferrer"
          className="bg-royal dark:bg-cornflower-300 text-cornflower-50 dark:text-haiti py-3 px-5 rounded transition hover:scale-[1.01] text-center flex gap-2 items-center mr-auto"
        >
          <img
            className="h-8 -my-1 -ml-2 hidden dark:block"
            src="/icon-black.svg"
            alt=""
          />
          <img
            className="h-8 -my-1 -ml-2 block dark:hidden"
            src="/icon-white.svg"
            alt=""
          />
          <span>
            Want to contribute? Come to the <b>Nebula Labs Kickoff</b> on Sept
            4th 7pm.
          </span>
        </a>*/}
        <Link href="/planner" className="ml-auto rounded-xl">
          <Button className="bg-cornflower-500 rounded-xl text-white dark:bg-cornflower-400 text p-2 px-4 normal-case">
            <BookIcon className="mr-2" />
            My Planner
          </Button>
        </Link>
      </div>
      <div className="max-w-xl grow flex flex-col justify-center">
        <h2 className="text-sm font-semibold mb-3 text-cornflower-600 dark:text-cornflower-400 tracking-wider flex gap-1 items-center">
          <span className="leading-none">POWERED BY</span>
          {/*eslint-disable-next-line react/jsx-no-target-blank*/}
          <a
            href="https://www.utdnebula.com/"
            target="_blank"
            rel="noopener"
            className="underline decoration-transparent hover:decoration-inherit transition flex gap-1 items-center"
          >
            <NebulaLogo className="h-4 w-auto fill-cornflower-600 dark:fill-cornflower-400" />
            <span className="leading-none">NEBULA LABS</span>
          </a>
        </h2>
        <h1 className="text-6xl font-extrabold font-display mb-6">
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
          input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
          isPending={isPending}
        />
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
              label={
                'Teaching ' +
                (typeof props.latestSemester !== 'undefined' &&
                props.latestSemester.message === 'success'
                  ? 'in ' +
                    displaySemesterName(props.latestSemester.data, false)
                  : 'Next Semester')
              }
            />
          </FormControl>
        </Tooltip>
      </div>
    </div>
  );
}
