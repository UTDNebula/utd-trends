'use client';

import { Skeleton, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  searchQuery: {
    profFirst?: string;
    profLast?: string;
  };
}

export function LoadingRmpSummary() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="text" />
      ))}
      <Skeleton variant="text" width="50%" />
      <Typography variant="overline" className="text-gray-700 dark:text-gray-300">
        AI REVIEW SUMMARY
      </Typography>
    </>
  );
}

export default function RmpSummary({ open, searchQuery }: Props) {
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
    const msg = errorMsg?.toLowerCase() || '';

    if (msg.includes('not enough')) {
      return (
        <div className="p-4 my-2 border border-blue-500/20 bg-blue-500/5 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Summary Unavailable:</strong>{' '}
            We need at least 5 student reviews to generate an accurate AI summary.
          </p>
        </div>
      );
    }

    return (
      <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg">
        <p className="text-red-400 text-sm italic">
          {errorMsg || 'Problem loading AI review summary.'}
        </p>
      </div>
    );
  }

  // ----------------------------
  // LOADING UI
  // ----------------------------
  if (status === 'loading') {
    return <LoadingRmpSummary />;
  }

  // ----------------------------
  // SUCCESS UI
  // ----------------------------
  if (status === 'done' && summary) {
    return (
      <>
        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {summary}
        </p>

        <Tooltip title="AI generated summary" placement="right">
          <span className="inline-block">
            <Typography
              variant="overline"
              className="text-gray-700 dark:text-gray-300 cursor-help"
            >
              AI REVIEW SUMMARY
            </Typography>
          </span>
        </Tooltip>
      </>
    );
  }

  return null;
}