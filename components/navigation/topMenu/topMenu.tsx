import { Share } from '@mui/icons-material';
import { IconButton, Snackbar, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { SplashPageSearchBar } from '../../common/SplashPageSearchBar/splashPageSearchBar';
import { LogoIcon } from '../../icons/LogoIcon/logoIcon';

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export function TopMenu() {
  const router = useRouter();
  const [openCopied, setOpenCopied] = useState<boolean>(false);

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
  function searchOptionChosen(chosenOption: SearchQuery | null) {
    console.log('The option chosen was: ', chosenOption);
  }

  return (
    <>
      <div className="bg-primary h-16 text-light relative py-2 px-4">
        <div className="h-full flex min-w-fit justify-between">
          <Link href="/" className="m-2">
            <div className="h-full flex align-middle place-items-center justify-center">
              <div className="h-full float-left mr-2 w-7">
                <LogoIcon />
              </div>
              <h1 className="float-right text-xl text-light-always">
                UTD Trends
              </h1>
            </div>
          </Link>
          <div className="w-24 h-1/4 m-auto pb-12">
            <SplashPageSearchBar
              selectSearchValue={searchOptionChosen}
              disabled={false}
            />
          </div>
          <Tooltip title="Share link with search queries">
            <IconButton
              className="w-12"
              size="large"
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
              <Share className="fill-light-always text-3xl mr-1" />
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
    </>
  );
}

export default TopMenu;
