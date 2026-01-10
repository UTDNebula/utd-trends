'use client';

import { searchQueryEqual, type SearchQuery } from '@/types/SearchQuery';
import { Collapse, Link, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

export function LoadingSyllabusSummary() {
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

type SyllabusData = {
  grade_weights: { category: string; percentage: string }[];
  letter_grade_scale: { grade: string; range: string }[];
  summary: string;
};

type Props = {
  open: boolean;
  searchQuery: SearchQuery;
  syllabus_uri: string;
  showSyllabus: boolean;
};

export default function SyllabusSummary({
  open,
  searchQuery,
  syllabus_uri,
  showSyllabus,
}: Props) {
  const searchQueryRef = useRef(searchQuery);
  const [state, setState] = useState<'closed' | 'loading' | 'error' | 'done'>(
    'closed',
  );
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);

  useEffect(() => {
    if (!searchQueryEqual(searchQueryRef.current, searchQuery)) {
      searchQueryRef.current = searchQuery;
      setState('closed');
      setSyllabus(null);
    }
    if (open && state === 'closed') {
      setState('loading');
      const params = new URLSearchParams();
      if (syllabus_uri) params.append('syllabus_uri', syllabus_uri);
      fetch(`/api/syllabusSummary?${params.toString()}`, {
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
          setSyllabus(data.data);
        });
    }
  }, [open, state, searchQuery]);

  if (state === 'error') {
    return <p>Problem loading AI review summary.</p>;
  }

  if (!syllabus) {
    return <LoadingSyllabusSummary />;
  }

  return (
    <>
      <Collapse in={showSyllabus}>
        <div className="mt-4 rounded p-3">
          <h3 className="font-bold text-xl mb-2">Syllabus Grading Summary</h3>
          <hr className="mb-4" />

          {/* Outer flex row: tables + AI summary */}
          <div className="flex gap-8 items-center mt-2">
            {/* Tables wrapper */}
            <div className="tables-container flex gap-8">
              {/* Weighting Table */}
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 font-semibold text-lg">
                      Weighting
                    </th>
                    <th className="px-2 py-1 font-semibold text-lg">%</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabus.grade_weights.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{row.category}</td>
                      <td className="px-2 py-1">{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grade Scale Table */}
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 font-semibold text-lg">Grade</th>
                    <th className="px-2 py-1 font-semibold text-lg">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabus.letter_grade_scale.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{row.grade}</td>
                      <td className="px-2 py-1">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Summary / Placeholder */}
            <div
              id="ai-summary"
              className="text-sm flex flex-col items-center flex-1 min-h-[100px]"
            >
              <p>{syllabus.summary}</p>
              <Link
                href={syllabus_uri}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Syllabus
              </Link>
            </div>
          </div>
        </div>
      </Collapse>
    </>
  );
}
