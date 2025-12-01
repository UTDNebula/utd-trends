'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Chip, Collapse, Grid, IconButton, Skeleton } from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { RMP } from '@/modules/fetchRmp';

export function LoadingSingleProfInfo() {
  const loadingTags = [
    'Group projects (54)',
    'Lecture heavy (29)',
    'Hilarious (13)',
    'Respected (9)',
    'Clear grading criteria (9)',
  ];
  return (
    <Grid container spacing={2} className="p-4">
      {/* Loading skeletons for each metric */}
      <Grid size={6}>
        <Skeleton variant="rounded">
          <p className="text-xl font-bold">5.0</p>
        </Skeleton>
        <p>Professor rating</p>
      </Grid>
      <Grid size={6}>
        <Skeleton variant="rounded">
          <p className="text-xl font-bold">5.0</p>
        </Skeleton>
        <p>Difficulty</p>
      </Grid>
      <Grid size={6}>
        <Skeleton variant="rounded">
          <p className="text-xl font-bold">1,000</p>
        </Skeleton>
        <p>Ratings given</p>
      </Grid>
      <Grid size={6}>
        <Skeleton variant="rounded">
          <p className="text-xl font-bold">99%</p>
        </Skeleton>
        <p>Would take again</p>
      </Grid>

      <Grid size={12}>
        <div className="flex gap-1 flex-wrap">
          {loadingTags.map((tag, index) => (
            <Skeleton key={index} variant="rounded" className="rounded-full">
              <Chip label={tag} />
            </Skeleton>
          ))}
          <Skeleton variant="rounded" className="rounded-full">
            <IconButton size="small">
              <ExpandMoreIcon />
            </IconButton>
          </Skeleton>
        </div>
      </Grid>

      <Grid size={12}>
        <Skeleton variant="rounded">
          <p>Visit Rate My Professors</p>
        </Skeleton>
      </Grid>
    </Grid>
  );
}

type Props = {
  rmp: RMP;
};

export default function SingleProfInfo({ rmp }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);

  if (rmp.numRatings == 0) {
    return (
      <Grid container spacing={2} className="p-4">
        <Grid size={6}>
          <p className="text-xl font-bold">{rmp.numRatings.toLocaleString()}</p>
          <p>Ratings given</p>
        </Grid>
        <Grid size={12}>
          <Link
            href={'https://www.ratemyprofessors.com/professor/' + rmp.legacyId}
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Visit Rate My Professors
          </Link>
        </Grid>
      </Grid>
    );
  }

  const topTags = rmp.teacherRatingTags.sort((a, b) => b.tagCount - a.tagCount);
  const first5 = topTags.slice(0, 5);
  const next5 = topTags.slice(5, 10);

  return (
    <Grid container spacing={2} className="p-4">
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.avgRating > 0 ? rmp.avgRating : 'N/A'}
        </p>
        <p>Professor rating</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.avgDifficulty > 0 ? rmp.avgDifficulty : 'N/A'}
        </p>
        <p>Difficulty</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">{rmp.numRatings.toLocaleString()}</p>
        <p>Ratings given</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.wouldTakeAgainPercent > 0
            ? rmp.wouldTakeAgainPercent.toFixed(0) + '%'
            : 'N/A'}
        </p>
        <p>Would take again</p>
      </Grid>

      {first5.length > 0 && (
        <Grid size={12}>
          <div className="flex gap-y-1 flex-wrap">
            {first5.map((tag, index) => (
              <Chip
                key={index}
                label={`${tag.tagName} (${tag.tagCount})`}
                variant="outlined"
                className="mr-1"
              />
            ))}
            {next5.length > 0 && (
              <>
                {next5.map((tag, index) => (
                  <Collapse key={index} in={showMore} orientation="horizontal">
                    <Chip
                      label={`${tag.tagName} (${tag.tagCount})`}
                      variant="outlined"
                      className="mr-1"
                    />
                  </Collapse>
                ))}
                <IconButton
                  size="small"
                  aria-label="show more"
                  onClick={() => setShowMore(!showMore)}
                >
                  <ExpandMoreIcon
                    className={
                      'transition ' + (showMore ? 'rotate-90' : '-rotate-90')
                    }
                  />
                </IconButton>
              </>
            )}
          </div>
        </Grid>
      )}

      <Grid size={12}>
        <div className="flex gap-7">
          <Link
            href={'https://www.ratemyprofessors.com/professor/' + rmp.legacyId}
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Visit Rate My Professors
          </Link>

          <button onClick={() => setShowSyllabus(!showSyllabus)}>
            View Syllabus Summary{' '}
            <ChevronRightIcon
              className={`transition-transform ${showSyllabus ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
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
                    <tr>
                      <td className="px-2 py-1">Attendance</td>
                      <td className="px-2 py-1">5%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Class Quiz</td>
                      <td className="px-2 py-1">20%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Projects</td>
                      <td className="px-2 py-1">20%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Midterm</td>
                      <td className="px-2 py-1">25%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Final</td>
                      <td className="px-2 py-1">30%</td>
                    </tr>
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
                    <tr>
                      <td className="px-2 py-1">A</td>
                      <td className="px-2 py-1 whitespace-nowrap">90-100</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">B</td>
                      <td className="px-2 py-1 whitespace-nowrap">80-89.9</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">C</td>
                      <td className="px-2 py-1 whitespace-nowrap">70-79.9</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">D</td>
                      <td className="px-2 py-1 whitespace-nowrap">60-69.9</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">F</td>
                      <td className="px-2 py-1 whitespace-nowrap">0-59.9</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AI Summary / Placeholder */}
              <div
                id="ai-summary"
                className="text-sm flex items-center  flex-1 min-h-[100px]"
              >
                <p>
                  Regular lecture attendance is mandatory. Attendance will be
                  taken randomly at some lectures. Students who fail to follow
                  the class material regularly are inviting scholastic
                  difficulty.
                </p>
              </div>
            </div>
          </div>
        </Collapse>
      </Grid>
    </Grid>
  );
}
