import { Share } from '@mui/icons-material';
import BookIcon from '@mui/icons-material/Book';
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Background from '@/../public/background.png';
import SearchBar from '@/components/search/SearchBar/SearchBar';

/**
 * Props type used by the TopMenu component
 */
type DashboardTopMenuProps = {
  resultsLoading: 'loading' | 'done' | 'error';
  setResultsLoading: () => void;
  isPlanner: false;
};
type PlannerTopMenuProps = {
  isPlanner: true;
};
type TopMenuProps = DashboardTopMenuProps | PlannerTopMenuProps;

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export function TopMenu(props: TopMenuProps) {
  const router = useRouter();
  const [openCopied, setOpenCopied] = useState(false);

  function shareLink(url: string) {
    if (navigator.share) {
      navigator
        .share({
          title: 'UTD Trends',
          url: url,
        })
        .catch(() => copyLink(url));
    } else {
      copyLink(url);
    }
  }
  function copyLink(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => setOpenCopied(true))
        .catch(() => alertLink(url));
    } else {
      alertLink(url);
    }
  }
  function alertLink(url: string) {
    alert(url);
  }

  return (
    <>
      <div className="relative overflow-hidden flex items-center gap-y-0 gap-x-4 md:gap-x-8 lg:gap-x-16 py-1 md:py-2 px-4 md:px-8 lg:px-16 bg-lighten dark:bg-darken flex-wrap sm:flex-nowrap">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
          priority
        />
        <Link
          href="/"
          className="lext-lg md:text-xl font-kallisto font-medium md:font-bold"
        >
          UTD TRENDS
        </Link>
        {!props.isPlanner && (
          <SearchBar
            manageQuery="onSelect"
            resultsLoading={props.resultsLoading}
            setResultsLoading={props.setResultsLoading}
            className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
            input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
          />
        )}
        <Link
          href={props.isPlanner ? '/dashboard' : '/planner'}
          className="ml-auto rounded-xl"
        >
          <Button className="bg-cornflower-500 rounded-xl text-white dark:bg-cornflower-400 text p-2 px-4 normal-case">
            <BookIcon className="mr-2" />
            {props.isPlanner ? 'Search Results' : 'My Planner'}
          </Button>
        </Link>
        <Tooltip title="Share link to search">
          <IconButton
            className="aspect-square"
            size="medium"
            onClick={() => {
              let url = window.location.href;
              if (
                router.query &&
                Object.keys(router.query).length === 0 &&
                Object.getPrototypeOf(router.query) === Object.prototype
              ) {
                url = 'https://trends.utdnebula.com/';
              }
              shareLink(url);
            }}
          >
            <Share className="text-3xl mr-1" />
          </IconButton>
        </Tooltip>
      </div>
      <Snackbar
        open={openCopied}
        autoHideDuration={6000}
        onClose={() => setOpenCopied(false)}
        message="Copied!"
      />
    </>
  );
}

export default TopMenu;
