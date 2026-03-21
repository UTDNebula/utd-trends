'use client';

import { type SearchQuery } from '@/types/SearchQuery';
import { Skeleton, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

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
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const status = !open
    ? 'closed'
    : error
      ? 'error'
      : summary === null
        ? 'loading'
        : 'done';

  // Fetch when opened
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

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
        if (cancelled) return;

        if (data.message !== 'success') {
          setError(true);
          return;
        }
        setSummary(data.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, searchQuery]);

  if (status === 'error') {
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
