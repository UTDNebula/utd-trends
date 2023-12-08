import GitHub from '@mui/icons-material/GitHub';
import { Card, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import React from 'react';

export default function GitHubButton() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const cardElevation = prefersDarkMode ? 3 : 1;

  const showGitInfo =
    typeof process.env.NEXT_PUBLIC_VERCEL_ENV !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    typeof process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== 'undefined' &&
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA !== '';

  if (!showGitInfo) {
    return null;
  }

  return (
    <Card
      className="w-fit h-fit bg-light fixed bottom-2 right-2 rounded-full"
      elevation={cardElevation}
    >
      <Tooltip title="Open GitHub commit for this instance">
        <a
          href={
            'https://github.com/UTDNebula/utd-trends/commit/' +
            process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconButton size="large">
            <GitHub className="fill-dark text-3xl" />
          </IconButton>
        </a>
      </Tooltip>
    </Card>
  );
}
