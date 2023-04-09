import { IconButton } from '@mui/material';
import { LogoIcon } from '../../icons/LogoIcon/logoIcon';
import { Share } from '@mui/icons-material';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * This is a component to hold UTD Trends branding and basic navigation
 * @returns
 */
export function TopMenu() {
  const router = useRouter();

  return (
    <div className="bg-primary h-16 text-light relative py-2 px-4">
      <div className="h-full flex min-w-fit justify-between">
        <Link href="/">
          <a className="my-2 mx-2">
            <div className="h-full flex align-middle place-items-center justify-center">
              <div className="h-full float-left mr-2 w-7">
                <LogoIcon />
              </div>
              <h1 className=" float-right text-xl">UTD Trends</h1>
            </div>
          </a>
        </Link>
        <IconButton
          className="w-12"
          size="large"
          onClick={() => {
            let url = router.asPath;
            if (
              router.query &&
              Object.keys(router.query).length === 0 &&
              Object.getPrototypeOf(router.query) === Object.prototype
            ) {
              url = 'https://trends.utdnebula.com/';
            }
            if (navigator.share) {
              navigator.share({
                title: 'UTD Trends',
                url: url,
              });
            } else if (navigator.clipboard) {
              navigator.clipboard.writeText(url);
            } else {
              alert(url);
            }
          }}
        >
          <Share className="fill-primary-dark text-3xl mr-1" />
        </IconButton>
      </div>
    </div>
  );
}

export default TopMenu;
