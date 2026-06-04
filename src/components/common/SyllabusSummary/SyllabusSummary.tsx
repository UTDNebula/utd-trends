'use client';

import BaseCard from '@/components/common/BaseCard/BaseCard';
import { type SearchQuery } from '@/types/SearchQuery';
import {
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
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
  syllabus_sem: string;
};

export default function SyllabusSummary({
  open,
  searchQuery,
  syllabus_uri,
  syllabus_sem,
}: Props) {
  const [state, setState] = useState<'closed' | 'error' | 'done'>('closed');
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);

  useEffect(() => {
    if (open && !syllabus && state !== 'error') {
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
  }, [open, state, searchQuery, syllabus_uri, syllabus]);

  if (state === 'error') {
    return (
      <Grid size={12}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>Problem loading AI syllabus summary.</p>
          <Link
            href={syllabus_uri}
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            View Syllabus
          </Link>
        </div>
      </Grid>
    );
  }

  return (
    <>
      {!syllabus ? (
        <LoadingSyllabusSummary />
      ) : (
        <>
          {/* Weighting Table */}
          {syllabus.grade_weights != null &&
            syllabus.grade_weights.length > 0 && (
              <Grid size={6}>
                <BaseCard className="dark:bg-neutral-700">
                  <TableContainer>
                    <Table size="small" aria-label="grade weighting table">
                      <TableHead>
                        <TableRow>
                          <TableCell className="font-bold">Weighting</TableCell>
                          <TableCell className="font-bold">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syllabus.grade_weights.map((row, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.category}
                            </TableCell>
                            <TableCell>{row.percentage}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </BaseCard>
              </Grid>
            )}

          {/* Grade Scale Table */}
          {syllabus.letter_grade_scale != null &&
            syllabus.letter_grade_scale.length > 0 && (
              <Grid size={6}>
                <BaseCard className="dark:bg-neutral-700">
                  <TableContainer>
                    <Table size="small" aria-label="grade scale table">
                      <TableHead>
                        <TableRow>
                          <TableCell className="font-bold">Grade</TableCell>
                          <TableCell className="font-bold">Scale</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syllabus.letter_grade_scale.map((row, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.grade}
                            </TableCell>
                            <TableCell>{row.range}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </BaseCard>
              </Grid>
            )}

          {/* AI Summary / Placeholder */}
          <Grid size={12}>
            {syllabus.summary != null ? (
              <p>{syllabus.summary}</p>
            ) : (
              <p>Could not summarize the syllabus.</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Tooltip
                title="This summary is AI generated. Please double check any important information"
                placement="right"
              >
                <Typography
                  variant="overline"
                  className="text-gray-700 dark:text-gray-300"
                >
                  AI SYLLABUS SUMMARY
                </Typography>
              </Tooltip>
              <Link
                href={syllabus_uri}
                target="_blank"
                className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              >
                View Syllabus
              </Link>
            </div>
          </Grid>
        </>
      )}
    </>
  );
}
