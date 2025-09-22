'use client';

import BookIcon from '@mui/icons-material/Book';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShareIcon from '@mui/icons-material/Share';
import { Button, IconButton, Snackbar, Tooltip } from '@mui/material';
import html2canvas from 'html2canvas-pro';
import Image from 'next/image';
import Link from 'next/link';
import React, { Suspense, useCallback, useEffect, useState } from 'react';

import Background from '@/../public/background.png';
import WhatsNew from '@/components/common/WhatsNew/WhatsNew';
import Tutorial from '@/components/dashboard/Tutorial/Tutorial';
import NebulaLogo from '@/components/icons/NebulaLogo/NebulaLogo';
import SearchBar, {
  LoadingSearchBar,
} from '@/components/search/SearchBar/SearchBar';

/**
 * Props type used by the TopMenu component
 */
type Props = {
  isPlanner: boolean;
  downloadRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export default function TopMenu(props: Props) {
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

  const [dashboardSearchTerms, setDashboardSearchTerms] = useState<
    null | string
  >(null);
  useEffect(() => {
    setDashboardSearchTerms(
      window.sessionStorage.getItem('dashboardSearchTerms'),
    );
  }, []);

  return (
    <>
      <div className="relative overflow-hidden flex items-center gap-y-0 gap-x-2 md:gap-x-4 lg:gap-x-8 py-1 md:py-2 px-4 md:px-8 lg:px-16 bg-lighten dark:bg-darken flex-wrap sm:flex-nowrap">
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
          priority
        />
        <Link
          href="/"
          className="lext-lg md:text-xl font-display font-medium md:font-bold flex gap-2 items-center"
        >
          <NebulaLogo className="h-6 w-auto fill-haiti dark:fill-white" />
          UTD TRENDS
        </Link>
        {!props.isPlanner && (
          <Suspense
            fallback={
              <LoadingSearchBar
                className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
                input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
              />
            }
          >
            <SearchBar
              manageQuery="onSelect"
              className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
              input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
            />
          </Suspense>
        )}
        <Link
          href={
            props.isPlanner
              ? dashboardSearchTerms != null
                ? '/dashboard?' + dashboardSearchTerms
                : '/dashboard?availability=true'
              : '/planner'
          }
          onClick={() =>
            !props.isPlanner
              ? sessionStorage.setItem(
                  'dashboardSearchTerms',
                  new URLSearchParams(window.location.search).toString(),
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
          <Tooltip title={`${props.isPlanner ? "Download your Schedule" : "Share link to Search"}`}>
            { props.isPlanner ?
            (
            <IconButton
              className="aspect-square"
              size="medium"
              onClick={() => {
                const refObj = props.downloadRef

                if (!refObj.current) {return}
                
                html2canvas(refObj.current).then((canvasImg : HTMLCanvasElement) => {
                  const linkTag = document.createElement("a")

                  canvasImg.toBlob((blob) => {
                    if (!blob) { return }
                    if (refObj.current === null) {return}

                    const imgURL = URL.createObjectURL(blob)
                    linkTag.href = imgURL
                    linkTag.download = "schedule.png"

                    // Adding temp a tag for the download functionality (alternative to adding an api route handler)
                    
                    document.body.appendChild(linkTag)
                    linkTag.click()
                    document.body.removeChild(linkTag)

                    // Removing ref to the object url

                    URL.revokeObjectURL(imgURL)
                  })
                })
              }}
            >
              <DownloadIcon className="text-3xl mt-0.5" />
            
            </IconButton>
            ) : (
              <IconButton
              className="aspect-square"
              size="medium"
              onClick={() => {
                let url = window.location.href;
                if (
                  new URLSearchParams(window.location.search).toString() === ''
                ) {
                  url = 'https://trends.utdnebula.com/';
                }
                shareLink(url);
              }}
              >
                <ShareIcon className="text-3xl mr-0.5 -ml-0.5" />
              </IconButton>
            )
          }
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
