'use client';

import BaseCard from '@/components/common/BaseCard/BaseCard';
import { type SearchQuery } from '@/types/SearchQuery';
import {
  Button,
  Collapse,
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

const MAX_VISIBLE_ROWS = 2;

type LoadingSyllabusSummaryProps = {
  syllabus_uri?: string;
  syllabus_sem?: string;
};

export function LoadingSyllabusSummary({
  syllabus_uri,
  syllabus_sem,
}: LoadingSyllabusSummaryProps) {
  return (
    <>
      {/* Weighting Table */}
      <Grid size={6}>
        <BaseCard className="dark:bg-neutral-700">
          <TableContainer>
            <Table size="small" aria-label="grade weighting table">
              <colgroup>
                <col className="w-1/2" />
                <col className="w-1/2" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold">Weighting</TableCell>
                  <TableCell className="font-bold">%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array(2)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Skeleton variant="text" className="w-1/2" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" className="w-1/4" />
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0,
                    },
                  }}
                >
                  <TableCell align="center" className="py-0" colSpan={2}>
                    <Button className="normal-case" size="small" disabled>
                      Show More
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </BaseCard>
      </Grid>

      {/* Grade Scale Table */}
      <Grid size={6}>
        <BaseCard className="dark:bg-neutral-700">
          <TableContainer>
            <Table size="small" aria-label="grade scale table">
              <colgroup>
                <col className="w-1/2" />
                <col className="w-1/2" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell className="font-bold">Grade</TableCell>
                  <TableCell className="font-bold">Scale</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array(2)
                  .fill(0)
                  .map((_, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0,
                        },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Skeleton variant="text" className="w-1/4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" className="w-1/4" />
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0,
                    },
                  }}
                >
                  <TableCell align="center" className="py-0" colSpan={2}>
                    <Button className="normal-case" size="small" disabled>
                      Show More
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </BaseCard>
      </Grid>

      {/* AI Summary / Placeholder */}
      <Grid size={12}>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-1/2" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography
            variant="overline"
            className="text-gray-700 dark:text-gray-300"
          >
            AI SYLLABUS SUMMARY
          </Typography>
          {syllabus_uri && syllabus_sem ? (
            <Link
              href={syllabus_uri}
              target="_blank"
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              View {syllabus_sem} Syllabus
            </Link>
          ) : (
            <p>View Syllabus</p>
          )}
        </div>
      </Grid>
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

  const [showMoreWeights, setShowMoreWeights] = useState(false);
  const [showMoreGrades, setShowMoreGrades] = useState(false);

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
            View {syllabus_sem} Syllabus
          </Link>
        </div>
      </Grid>
    );
  }

  return (
    <>
      {!syllabus ? (
        <LoadingSyllabusSummary
          syllabus_uri={syllabus_uri}
          syllabus_sem={syllabus_sem}
        />
      ) : (
        <>
          {/* Weighting Table */}
          {syllabus.grade_weights != null &&
            syllabus.grade_weights.length > 0 && (
              <Grid size={6}>
                <BaseCard className="dark:bg-neutral-700">
                  <TableContainer>
                    <Table size="small" aria-label="grade weighting table">
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                      </colgroup>
                      <TableHead>
                        <TableRow>
                          <TableCell className="font-bold">Weighting</TableCell>
                          <TableCell className="font-bold">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syllabus.grade_weights
                          .slice(0, MAX_VISIBLE_ROWS)
                          .map((row, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.category}
                              </TableCell>
                              <TableCell>{row.percentage}</TableCell>
                            </TableRow>
                          ))}
                        {syllabus.grade_weights.length > MAX_VISIBLE_ROWS && (
                          <>
                            <TableRow>
                              <TableCell colSpan={2} className="p-0 border-0">
                                <Collapse
                                  in={showMoreWeights}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Table size="small">
                                    <colgroup>
                                      <col className="w-1/2" />
                                      <col className="w-1/2" />
                                    </colgroup>
                                    <TableBody>
                                      {syllabus.grade_weights
                                        .slice(MAX_VISIBLE_ROWS)
                                        .map((row, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell
                                              component="th"
                                              scope="row"
                                            >
                                              {row.category}
                                            </TableCell>
                                            <TableCell>
                                              {row.percentage}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                            <TableRow
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                align="center"
                                className="py-0"
                                colSpan={2}
                              >
                                <Button
                                  className="normal-case"
                                  size="small"
                                  onClick={() =>
                                    setShowMoreWeights(!showMoreWeights)
                                  }
                                >
                                  {showMoreWeights ? 'Show Less' : 'Show More'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
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
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                      </colgroup>
                      <TableHead>
                        <TableRow>
                          <TableCell className="font-bold">Grade</TableCell>
                          <TableCell className="font-bold">Scale</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {syllabus.letter_grade_scale
                          .slice(0, MAX_VISIBLE_ROWS)
                          .map((row, idx) => (
                            <TableRow
                              key={idx}
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {row.grade}
                              </TableCell>
                              <TableCell>{row.range}</TableCell>
                            </TableRow>
                          ))}
                        {syllabus.letter_grade_scale.length >
                          MAX_VISIBLE_ROWS && (
                          <>
                            <TableRow>
                              <TableCell colSpan={2} className="p-0 border-0">
                                <Collapse
                                  in={showMoreGrades}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Table size="small">
                                    <colgroup>
                                      <col className="w-1/2" />
                                      <col className="w-1/2" />
                                    </colgroup>
                                    <TableBody>
                                      {syllabus.letter_grade_scale
                                        .slice(MAX_VISIBLE_ROWS)
                                        .map((row, idx) => (
                                          <TableRow key={idx}>
                                            <TableCell
                                              component="th"
                                              scope="row"
                                            >
                                              {row.grade}
                                            </TableCell>
                                            <TableCell>{row.range}</TableCell>
                                          </TableRow>
                                        ))}
                                    </TableBody>
                                  </Table>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                            <TableRow
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                align="center"
                                className="py-0"
                                colSpan={2}
                              >
                                <Button
                                  className="normal-case"
                                  size="small"
                                  onClick={() =>
                                    setShowMoreGrades(!showMoreGrades)
                                  }
                                >
                                  {showMoreGrades ? 'Show Less' : 'Show More'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
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
                View {syllabus_sem} Syllabus
              </Link>
            </div>
          </Grid>
        </>
      )}
    </>
  );
}
