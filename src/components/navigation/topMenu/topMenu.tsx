import { Share } from '@mui/icons-material';
import { IconButton, Snackbar, Tooltip, useMediaQuery } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import Background from '@/../public/background.png';
import SearchBar from '@/components/search/SearchBar/searchBar';

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export function TopMenu() {
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

  const matches = useMediaQuery('(min-width: 640px)');
  const searchBar = (
    <SearchBar
      manageQuery="onSelect"
      className={'shrink ' + (matches ? 'basis-[32rem]' : 'basis-full')}
      input_className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
    />
  );

  return (
    <>
      <div
        className={
          'relative overflow-hidden flex items-center gap-y-0 gap-x-4 md:gap-x-8 lg:gap-x-16 py-1 md:py-2 px-4 md:px-8 lg:px-16 bg-lighten dark:bg-darken' +
          (matches ? '' : ' flex-wrap')
        }
      >
        <Image
          src={Background}
          alt="gradient background"
          fill
          className="object-cover -z-20"
        />
        <Link
          href="/"
          className="lext-lg md:text-xl font-kallisto font-medium md:font-bold"
        >
          UTD TRENDS
        </Link>
        {matches && searchBar}
        <Tooltip title="Share link to search" className="ml-auto">
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
        {!matches && searchBar}
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
