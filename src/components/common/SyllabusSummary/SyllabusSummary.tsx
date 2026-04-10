'use client';

import { type SearchQuery } from '@/types/SearchQuery';
import { Collapse, Link, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

export function LoadingSyllabusSummary() {
  return (
    <div className="mt-2 rounded pv-3 max-w-dvw">
      <div className="rounded p-4 dark:bg-neutral-900/50 bg-neutral-200 border border-cornflower-500">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <Typography
        variant="overline"
        className="text-gray-700 dark:text-gray-300 pr-5"
      >
        AI GENERATED SYLLABUS SUMMARY
      </Typography>
    </div>
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
  const [state, setState] = useState<'closed' | 'error' | 'done'>('closed');
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);

  useEffect(() => {
    if (open && showSyllabus && !syllabus && state !== 'error') {
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
  }, [open, state, searchQuery, syllabus_uri, showSyllabus, syllabus]);

  if (state === 'error') {
    return <p>Problem loading AI syllabus summary.</p>;
  }

  return (
    <>
      <Collapse in={showSyllabus}>
        {!syllabus ? (
          <LoadingSyllabusSummary />
        ) : (
          <div className="mt-2 rounded pv-3 max-w-dvw">
            {/* Outer flex row: tables + AI summary */}
            <div className="flex gap-8 items-start mt-2 flex-wrap rounded p-4 dark:bg-neutral-900/50 bg-neutral-200 border border-cornflower-500">
              {/* Tables wrapper */}
              <div className="tables-container flex items-start gap-8 width-full max-w-dvw">
                {/* Weighting Table */}
                {syllabus.grade_weights != null &&
                  syllabus.grade_weights.length > 0 && (
                    <table className="text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 font-bold text-md">
                            Weighting
                          </th>
                          <th className="px-2 py-1 font-bold text-md">%</th>
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
                  )}

                {/* Grade Scale Table */}
                {syllabus.letter_grade_scale != null &&
                  syllabus.letter_grade_scale.length > 0 && (
                    <table className="text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 font-bold text-md">Grade</th>
                          <th className="px-2 py-1 font-bold text-md">Scale</th>
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
                  )}
              </div>

              {/* AI Summary / Placeholder */}
              <div
                id="ai-summary"
                className="text-sm flex flex-col items-start flex-1 min-h-[100px] max-w-dvw"
              >
                <p className="py-1 font-bold text-md">Course Notes</p>
                {syllabus.summary != null ? (
                  <p>{syllabus.summary}</p>
                ) : (
                  <p>Could not summarize the syllabus</p>
                )}
                <Link
                  href={syllabus_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Syllabus
                </Link>
              </div>
            </div>
            <Typography
              variant="overline"
              className="text-gray-700 dark:text-gray-300"
            >
              AI GENERATED SYLLABUS SUMMARY
            </Typography>
          </div>
        )}
      </Collapse>
    </>
  );
}
