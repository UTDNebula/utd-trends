import Background from '@/../public/background.png';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import { LoadingSearchBar } from '@/components/search/SearchBar/SearchBar';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import React from 'react';

/**
 * Returns the home page with Nebula Branding, waved background, and SearchBar Components
 */
export default function Loading() {
  return (
    <div className="relative bg-lighten dark:bg-darken h-full w-full flex flex-col items-center gap-4 px-8 py-4">
      <Image
        src={Background}
        alt="gradient background"
        fill
        className="object-cover -z-20"
      />
      <div className="absolute top-4 left-4 right-4 flex gap-2 place-content-between flex-wrap-reverse">
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
        <LoadingSearchBar input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti" />
        {/* Matches TeachingSemesterSelector on Home (Teaching in + semester) */}
        <div className="mt-4 flex w-full flex-wrap items-center gap-2">
          <Skeleton variant="rounded" className="h-[38px] w-[140px]" />
          <Skeleton
            variant="rounded"
            className="h-10 min-w-[160px] flex-1 sm:flex-none"
          />
        </div>
      </div>
    </div>
  );
}
