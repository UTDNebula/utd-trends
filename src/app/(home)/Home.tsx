'use client';

import Background from '@/../public/background.png';
import { useSharedState } from '@/app/SharedStateProvider';
import TeachingSemesterSelector from '@/components/common/TeachingSemesterSelector/TeachingSemesterSelector';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import SearchBar, {
  updateRecentSearches,
} from '@/components/search/SearchBar/SearchBar';
import { searchQueryLabel, type SearchQuery } from '@/types/SearchQuery';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
export default function Home() {
  const { effectiveTeachingSemester, setTeachingSemester, availableSemesters } =
    useSharedState();
  const router = useRouter();
  const [filterByTeachingSemester, setFilterByTeachingSemester] =
    React.useState(true);

  //for spinner after router.push
  const [isPending, startTransition] = useTransition();

  async function searchOptionChosen(chosenOptions: SearchQuery[]) {
    if (chosenOptions.length) {
      const params = new URLSearchParams({
        searchTerms: chosenOptions.map(searchQueryLabel).join(','),
      });
      if (filterByTeachingSemester && effectiveTeachingSemester) {
        params.set('availability', effectiveTeachingSemester);
      }
      startTransition(() => {
        router.push(`/dashboard?${params.toString()}`);
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
      <div className="absolute top-4 left-4 right-4 flex gap-2 flex-wrap-reverse">
        {/*Ad for Spring 2026*/}
        {/*<a
          href="https://trends.utdnebula.com/dashboard?searchTerms=GOVT+2306&availability=26S"
          target="_blank"
          rel="noreferrer"
          className="bg-royal dark:bg-cornflower-300 text-cornflower-50 dark:text-haiti rounded transition hover:scale-[1.01] text-center flex gap-2 items-center mr-auto"
        >
          <UTDTrendsLogoStandalone className="h-12 w-auto ml-2 fill-white dark:fill-haiti shrink-0" />
          <span className="my-3 mr-5">
            <b>Spring 2026</b> courses are now on Trends!
          </span>
        </a>*/}

        {/* Comet Giving Days button */}
        <Tooltip title="Support Nebula Labs on Comet Giving Days">
          <Link
            href="https://givingday.utdallas.edu/giving-day/115742/department/118896"
            target="_blank"
            className="ml-auto"
          >
            <Image
              unoptimized
              width={128}
              height={128}
              src="/comet-giving-days.png"
              alt="UTD Giving Days Comet Logo"
              className="h-12 w-12 max-w-none"
            />
          </Link>
        </Tooltip>
        <PlannerButton />
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
        {/* Teaching in semester selector */}
        {availableSemesters.length > 0 && (
          <TeachingSemesterSelector
            enabled={filterByTeachingSemester}
            onEnabledChangeAction={setFilterByTeachingSemester}
            semester={effectiveTeachingSemester}
            onSemesterChangeAction={setTeachingSemester}
            availableSemesters={availableSemesters}
            formControlClassName="mt-4"
            selectClassName="min-w-[160px] bg-white dark:bg-haiti"
          />
        )}
      </div>
    </div>
  );
}
