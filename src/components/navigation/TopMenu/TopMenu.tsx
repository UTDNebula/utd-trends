import BookIcon from '@mui/icons-material/Book';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShareIcon from '@mui/icons-material/Share';
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import Background from '@/../public/background.png';
import WhatsNew from '@/components/common/WhatsNew/WhatsNew';
import Tutorial from '@/components/dashboard/Tutorial/Tutorial';
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

  const [openTutorial, setOpenTutorial] = useState(false);
  const closeTutorial = useCallback(() => setOpenTutorial(false), []);
  const [tutorialHint, setTutorialHint] = useState(false);
  //Open if not already closed (based on localStorage)
  useEffect(() => {
    const previous = localStorage.getItem('tutorialHint');
    let ask = previous === null;
    if (previous !== null) {
      const parsed = JSON.parse(previous);
      if (parsed !== null && parsed.value !== 'opened') {
        ask = true;
      }
    }
    if (ask) {
      setTutorialHint(true);
    }
  }, []);
  const cacheIndex = 0; //Increment this to open the popup for all users on next deployment

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
          href={
            props.isPlanner
              ? typeof sessionStorage !== 'undefined' &&
                sessionStorage.getItem('dashboardSearchTerms')
                ? '/dashboard?' + sessionStorage.getItem('dashboardSearchTerms')
                : '/dashboard'
              : '/planner'
          }
          onClick={() =>
            !props.isPlanner
              ? sessionStorage.setItem(
                  'dashboardSearchTerms',
                  Object.entries(router.query)
                    .map(([key, value]) => {
                      if (typeof value === 'string') {
                        return key + '=' + encodeURIComponent(value);
                      }
                      return '';
                    })
                    .join('&') ?? '',
                )
              : null
          }
          className="ml-auto rounded-xl"
        >
          <Button className="bg-cornflower-500 rounded-xl text-white dark:bg-cornflower-400 text p-2 px-4 normal-case">
            <BookIcon className="mr-2" />
            {props.isPlanner ? 'Search Results' : 'My Planner'}
          </Button>
        </Link>
        <div className="flex gap-0 md:gap-4">
          <div className="ml-auto">
            <WhatsNew />
          </div>
          {!props.isPlanner && (
            <div className="relative">
              <div
                className={
                  tutorialHint
                    ? 'absolute w-11 h-11 rounded-full bg-royal dark:bg-cornflower-400 animate-ping'
                    : 'hidden'
                }
              />
              <div
                className={
                  tutorialHint
                    ? ' rounded-full bg-royal dark:bg-cornflower-400'
                    : ''
                }
              >
                <Tooltip title="Open Tutorial">
                  <IconButton
                    className="aspect-square"
                    size="medium"
                    onClick={() => {
                      setTutorialHint(false);
                      localStorage.setItem(
                        'tutorialHint',
                        JSON.stringify({
                          value: 'opened',
                          cacheIndex: cacheIndex,
                        }),
                      );
                      setOpenTutorial(true);
                    }}
                  >
                    <HelpOutlineIcon
                      className={
                        'text-3xl' + (tutorialHint ? ' text-white' : '')
                      }
                    />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}
          <Tooltip title="Share Link to Search">
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
              <ShareIcon className="text-3xl mr-0.5 -ml-0.5" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <Snackbar
        open={openCopied}
        autoHideDuration={6000}
        onClose={() => setOpenCopied(false)}
        message="Copied!"
      />
      <Tutorial open={openTutorial} close={closeTutorial} />
    </>
  );
}

export default TopMenu;
