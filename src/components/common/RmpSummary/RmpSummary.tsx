'use client';

import { searchQueryEqual, type SearchQuery } from '@/types/SearchQuery';
import { Skeleton, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

export function LoadingRmpSummary() {
  return (
    <>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-1/2" />
      <Typography
        variant="overline"
        className="text-gray-700 dark:text-gray-300"
      >
        AI REVIEW SUMMARY
      </Typography>
    </>
  );
}

type Props = {
  open: boolean;
  searchQuery: SearchQuery;
};

export default function RmpSummary({ open, searchQuery }: Props) {
  const searchQueryRef = useRef(searchQuery);
  const [state, setState] = useState<'closed' | 'loading' | 'error' | 'done'>(
    'closed',
  );
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQueryEqual(searchQueryRef.current, searchQuery)) {
      searchQueryRef.current = searchQuery;
      setState('closed');
      setSummary(null);
    }
    if (open && state === 'closed') {
      setState('loading');
      const params = new URLSearchParams();
      if (searchQuery.profFirst)
        params.append('profFirst', searchQuery.profFirst);
      if (searchQuery.profLast) params.append('profLast', searchQuery.profLast);
      fetch(`/api/rmpSummary?${params.toString()}`, {
        method: 'GET',
        next: { revalidate: 3600 },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message !== 'success') {
            setState('error');
            return;
          }
          setState('done');
          setSummary(data.data);
        });
    }
  }, [open, state, searchQuery]);

  if (state === 'error') {
    return <p>Problem loading AI review summary.</p>;
  }

  if (!summary) {
    return <LoadingRmpSummary />;
  }

  return (
    <>
      <p>{summary}</p>
      <Tooltip
        title="This summary is AI generated. Please double check any important information"
        placement="right"
      >
        <Typography
          variant="overline"
          className="text-gray-700 dark:text-gray-300"
        >
          AI REVIEW SUMMARY
        </Typography>
      </Tooltip>
    </>
  );
}
