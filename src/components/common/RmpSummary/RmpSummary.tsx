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

  const status = !open ? 'closed' : errorMsg ? 'error' : summary === null ? 'loading' : 'done';

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setErrorMsg(null);
      return;
    }

    let cancelled = false;
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery.profFirst) params.append('profFirst', searchQuery.profFirst);
        if (searchQuery.profLast) params.append('profLast', searchQuery.profLast);
        
        const res = await fetch(`/api/rmpSummary?${params.toString()}`);
        
        // Safety check for non-JSON or error responses
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        
        if (cancelled) return;

        if (data.message === 'error') {
          setErrorMsg(data.data || 'Problem loading AI review summary.');
        } else {
          setSummary(data.data);
        }
      } catch (err) {
        if (!cancelled) setErrorMsg('Problem loading AI review summary.');
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [open, searchQuery.profFirst, searchQuery.profLast]);

  if (status === 'error') {
    if (errorMsg?.includes('Not enough ratings')) {
      return (
        <div className="p-4 my-2 border border-blue-500/20 bg-blue-500/5 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Summary Unavailable:</strong> We need at least 5 student reviews to generate an accurate AI summary.
          </p>
        </div>
      );
    }
    return (
      <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg">
        <p className="text-red-400 text-sm italic">Problem loading AI review summary.</p>
      </div>
    );
  }

  if (status === 'loading') return <LoadingRmpSummary />;

  if (status === 'done') {
    return (
      <>
        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {summary}
        </p>
        <Tooltip title="AI generated summary" placement="right">
          {/* Wrap in span to fix the 'children' type error from your screenshot */}
          <span className="inline-block">
            <Typography variant="overline" className="text-gray-700 dark:text-gray-300 cursor-help">
              AI REVIEW SUMMARY
            </Typography>
          </span>
        </Tooltip>
      </>
    );
  }

  return null;
}