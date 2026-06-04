'use client';

import { type SearchQuery } from '@/types/SearchQuery';
import { Skeleton, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type LoadingProps = {
  legacyId?: string;
};

export function LoadingRmpSummary({ legacyId }: LoadingProps) {
  return (
    <>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography
          variant="overline"
          className="text-gray-700 dark:text-gray-300"
        >
          AI REVIEW SUMMARY
        </Typography>
        {legacyId ? (
          <Link
            href={'https://www.ratemyprofessors.com/professor/' + legacyId}
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Visit Rate My Professors
          </Link>
        ) : (
          <p>Visit Rate My Professors</p>
        )}
      </div>
    </>
  );
}

type Props = {
  open: boolean;
  searchQuery: SearchQuery;
  legacyId: string;
};

export default function RmpSummary({ open, searchQuery, legacyId }: Props) {
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
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>Problem loading AI review summary.</p>
        <Link
          href={'https://www.ratemyprofessors.com/professor/' + legacyId}
          target="_blank"
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Visit Rate My Professors
        </Link>
      </div>
    );
  }

  if (!summary) {
    return <LoadingRmpSummary legacyId={legacyId} />;
  }

  return (
    <>
      <p>{summary}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
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
        <Link
          href={'https://www.ratemyprofessors.com/professor/' + legacyId}
          target="_blank"
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Visit Rate My Professors
        </Link>
      </div>
    </>
  );
}
