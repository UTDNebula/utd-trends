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

interface LoadingGradeTableProps {
  ariaLabel: string;
  title: [string, string];
  dataWidths: [string, string];
}

function LoadingGradeTable({
  ariaLabel,
  title,
  dataWidths,
}: LoadingGradeTableProps) {
  return (
    <BaseCard className="bg-neutral-100 dark:bg-neutral-700">
      <TableContainer>
        <Table size="small" aria-label={ariaLabel}>
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">{title[0]}</TableCell>
              <TableCell className="font-bold">{title[1]}</TableCell>
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
                    <Skeleton variant="text" className={dataWidths[0]} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" className={dataWidths[1]} />
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
  );
}

interface GradeTableProps {
  ariaLabel: string;
  title: [string, string];
  data: [string, string][];
}

function GradeTable({ ariaLabel, title, data }: GradeTableProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <BaseCard className="bg-neutral-100 dark:bg-neutral-700">
      <TableContainer>
        <Table size="small" aria-label={ariaLabel}>
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">{title[0]}</TableCell>
              <TableCell className="font-bold">{title[1]}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(0, MAX_VISIBLE_ROWS).map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  '&:last-child td, &:last-child th': {
                    border: 0,
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  {row[0]}
                </TableCell>
                <TableCell>{row[1]}</TableCell>
              </TableRow>
            ))}
            {data.length > MAX_VISIBLE_ROWS && (
              <>
                <TableRow>
                  <TableCell colSpan={2} className="p-0 border-0">
                    <Collapse in={showMore} timeout="auto" unmountOnExit>
                      <Table size="small">
                        <colgroup>
                          <col className="w-1/2" />
                          <col className="w-1/2" />
                        </colgroup>
                        <TableBody>
                          {data.slice(MAX_VISIBLE_ROWS).map((row, idx) => (
                            <TableRow key={idx}>
                              <TableCell component="th" scope="row">
                                {row[0]}
                              </TableCell>
                              <TableCell>{row[1]}</TableCell>
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
                  <TableCell align="center" className="py-0" colSpan={2}>
                    <Button
                      className="normal-case"
                      size="small"
                      onClick={() => setShowMore(!showMore)}
                    >
                      {showMore ? 'Show Less' : 'Show More'}
                    </Button>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </BaseCard>
  );
}

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
        <LoadingGradeTable
          ariaLabel="grade weighting table"
          title={['Weighting', '%']}
          dataWidths={['w-1/2', 'w-1/4']}
        />
      </Grid>

      {/* Grade Scale Table */}
      <Grid size={6}>
        <LoadingGradeTable
          ariaLabel="grade scale table"
          title={['Grade', 'Scale']}
          dataWidths={['w-1/4', 'w-1/4']}
        />
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
                <GradeTable
                  ariaLabel="grade weighting table"
                  title={['Weighting', '%']}
                  data={syllabus.grade_weights.map((row) => [
                    row.category,
                    row.percentage,
                  ])}
                />
              </Grid>
            )}

          {/* Grade Scale Table */}
          {syllabus.letter_grade_scale != null &&
            syllabus.letter_grade_scale.length > 0 && (
              <Grid size={6}>
                <GradeTable
                  ariaLabel="grade scale table"
                  title={['Grade', 'Scale']}
                  data={syllabus.letter_grade_scale.map((row) => [
                    row.grade,
                    row.range,
                  ])}
                />
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
