'use client';

import Background from '@/../public/background.png';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import SearchBar, {
  updateRecentSearches,
} from '@/components/search/SearchBar/SearchBar';
import { displaySemesterName } from '@/modules/semesters';
import { searchQueryLabel, type SearchQuery } from '@/types/SearchQuery';
import { FormControl, FormControlLabel, Switch, Tooltip } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

interface Props {
  latestSemester: string;
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
        {/*Ad for Spring 2026*/}
        {/*<a
          href="https://trends.utdnebula.com/dashboard?searchTerms=GOVT+2306&availability=true"
          target="_blank"
          rel="noreferrer"
          className="bg-royal dark:bg-cornflower-300 text-cornflower-50 dark:text-haiti py-3 px-5 rounded transition hover:scale-[1.01] text-center flex gap-2 items-center mr-auto"
        >
          <Image
            className="h-8 -my-1 -ml-2 hidden dark:block"
            src="/icon-black.svg"
            alt=""
            width={32}
            height={32}
          />
          <Image
            className="h-8 -my-1 -ml-2 block dark:hidden"
            src="/icon-white.svg"
            alt=""
            width={32}
            height={32}
          />
          <span>
            <b>Spring 2026</b> courses are now on Trends!
          </span>
        </a>*/}
        <PlannerButton className="ml-auto" />
      </div>
      <div className="max-w-xl grow flex flex-col justify-center">
        <h2 className="text-sm font-semibold mb-3 text-royal dark:text-cornflower-300 tracking-wider flex gap-1 items-center">
          <span className="leading-none">POWERED BY</span>
          {}
          <a
            href="https://www.utdnebula.com/"
            target="_blank"
            rel="noopener"
            className="underline decoration-transparent hover:decoration-inherit transition flex gap-1 items-center"
          >
            <NebulaLogo className="h-4 w-auto fill-royal dark:fill-cornflower-300" />
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
          autoFocus={true}
          onSelect={searchOptionChosen}
          input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
          isPending={isPending}
        />
        {/* Teaching Next Semester switch*/}
        <Tooltip title="Select Availability" placement="bottom-start">
          <FormControl size="small" className="min-w-max flex-row items-center">
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
                props.latestSemester == ''
                  ? 'Teaching Next Semester'
                  : 'Teaching in ' +
                    displaySemesterName(props.latestSemester, false)
              }
            />
          </FormControl>
        </Tooltip>
      </div>
    </div>
  );
}
