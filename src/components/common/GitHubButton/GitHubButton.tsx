import GitHub from '@mui/icons-material/GitHub';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';

export default function GitHubButton() {
  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    typeof process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== '';

  if (!showGitInfo) {
    return null;
  }

  return (
    <Tooltip title="Open GitHub commit for this instance">
      <a
        href={
          'https://github.com/UTDNebula/utd-trends/commit/' +
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
        }
        rel="noreferrer"
        target="_blank"
        className="w-fit h-fit bg-white fixed bottom-2 left-2 rounded-full"
      >
        <IconButton size="large">
          <GitHub className="fill-black text-3xl" />
        </IconButton>
      </a>
    </Tooltip>
  );
}
