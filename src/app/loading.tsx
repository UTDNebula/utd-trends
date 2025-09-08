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
import React from 'react';

import Background from '@/../public/background.png';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import { LoadingSearchBar } from '@/components/search/SearchBar/SearchBar';

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
      <Link href="/planner" className="absolute top-4 right-4 rounded-xl">
        <Button className="bg-cornflower-500 rounded-xl text-white dark:bg-cornflower-400 text p-2 px-4 normal-case">
          <BookIcon className="mr-2" />
          My Planner
        </Button>
      </Link>
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
        <LoadingSearchBar input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti" />
        {/* Teaching Next Semester switch*/}
        <Tooltip title="Select Availability" placement="bottom-start">
          <FormControl
            size="small"
            className="min-w-max flex-row items-center [&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900"
          >
            <FormControlLabel
              control={<Switch checked disabled />}
              label="Teaching Next Semester"
            />
          </FormControl>
        </Tooltip>
      </div>
    </div>
  );
}
