'use client';

import { Skeleton, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type LoadingRmpSummaryProps = {
  legacyId?: string;
};

export function LoadingRmpSummary({ legacyId }: LoadingRmpSummaryProps) {
  return (
    <>
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const status = !open
    ? 'closed'
    : loading
      ? 'loading'
      : errorMsg
        ? 'error'
        : summary
          ? 'done'
          : 'idle';

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSummary = async () => {
      setLoading(true);
      setErrorMsg(null);
      setSummary(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery.profFirst) params.append('profFirst', searchQuery.profFirst);
        if (searchQuery.profLast) params.append('profLast', searchQuery.profLast);

        const res = await fetch(`/api/rmpSummary?${params.toString()}`);

        const data = await res.json();

        if (cancelled) return;

        // Handle API-level errors (your backend "message: error")
        if (!res.ok || data.message === 'error') {
          setErrorMsg(data.data || 'Problem loading AI review summary.');
          return;
        }

        setSummary(data.data);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg('Problem loading AI review summary.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [open, searchQuery.profFirst, searchQuery.profLast]);

  // ----------------------------
  // ERROR UI
  // ----------------------------
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
