import { Share } from '@mui/icons-material';
import { FormControl, IconButton, InputLabel, MenuItem, Select, Snackbar, Tooltip } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
//import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { SplashPageSearchBar } from '../../common/SplashPageSearchBar/splashPageSearchBar';
import { LogoIcon } from '../../icons/LogoIcon/logoIcon';

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export function TopMenu() {
  const router = useRouter();
  const sortOptions = ["Professor Name", "Course Number"];
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
          <div className="w-1/2 h-1/4 align-middle mt-4 pb-12">
            <SplashPageSearchBar
              selectSearchValue={searchOptionChosen}
              disabled={false}
            />
          </div>
          <div className="flex justify-center gap-2">
            <FormControl
              variant="standard"
            >
              <InputLabel id="sortLabel">Sort By</InputLabel>
              <Select
                labelId="sortLabel"
                defaultValue={0}
                //onChange=
              >
                <MenuItem key="Sort By" value="0">
                  Sort By
                </MenuItem>
                {sortOptions.map(
                  (s: string) => (
                    <MenuItem key={s} value={sortOptions.indexOf(s) + 1}>
                      {s}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
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
