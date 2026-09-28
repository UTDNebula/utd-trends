import UTDClubsLogo from '@/components/icons/UTDClubsLogo/UTDClubsLogo';
import { Button } from '@mui/material';
import React from 'react';

export default function ClubsBanner() {
  return (
    <Button
      href="https://clubs.utdnebula.com/"
      target="_blank"
      rel="noopener noreferrer"
      variant="contained"
      disableElevation
      className="!rounded-xl !bg-gradient-to-br !from-[#d4a08e] !via-[#9b7bd4] !to-[#3a6f96] !p-4 !mt-6 !mb-4 !normal-case !text-left !text-white !brightness-100 hover:!brightness-90 !transition-[filter] dark:!brightness-90 dark:hover:!brightness-75"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex items-center gap-3">
        <UTDClubsLogo className="w-10 h-10 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-xs font-semibold opacity-80 uppercase tracking-wider">
            UTD Clubs
          </span>
          <span className="font-bold text-sm leading-snug">
            Plan your club events too!
          </span>
        </div>
      </div>
    </Button>
  );
}
