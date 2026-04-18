import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';

export default function ClubsBanner() {
  return (
    <a
      href="https://clubs.utdnebula.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="block mx-4 mb-4 mt-2 rounded-xl no-underline group"
    >
      <div className="rounded-xl bg-gradient-to-br from-royalDark via-royal to-cornflower-500 p-4 flex items-center justify-between text-white transition-opacity hover:opacity-90">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">
            Nebula Clubs
          </span>
          <span className="font-bold text-sm leading-snug">
            Discover student organizations at UTD
          </span>
        </div>
        <OpenInNewIcon
          className="opacity-70 group-hover:opacity-100 transition-opacity shrink-0 ml-3"
          fontSize="small"
        />
      </div>
    </a>
  );
}
