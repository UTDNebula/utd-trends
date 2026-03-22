'use client';

import Compare from '@/components/compare/Compare/Compare';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Card, Link, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function ComparePage() {
  const [searchUrl, setSearchUrl] = useState('/');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const terms = window.sessionStorage.getItem('dashboardSearchTerms');
    if (terms) {
      setSearchUrl('/dashboard?' + terms);
    }
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between items-center p-4">
        <Typography className="leading-tight text-3xl font-bold">
          Compare
        </Typography>
        <Button
          variant="contained"
          loading={!mounted}
          size={'small'}
          className="hidden sm:flex normal-case rounded-full whitespace-nowrap w-fit h-fit"
          component={Link}
          href={searchUrl}
          startIcon={<SearchIcon />}
        >
          Go back to search
        </Button>
      </div>
      <Card className="w-full p-4">
        <Compare isMobile={true} />
      </Card>
    </>
  );
}
