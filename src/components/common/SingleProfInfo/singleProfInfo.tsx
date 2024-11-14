import { Chip, Grid2 as Grid, Skeleton } from '@mui/material';
import Link from 'next/link';
import React from 'react';

import type { RMPInterface } from '../../../pages/api/ratemyprofessorScraper';
import type { GenericFetchedData } from '../../../pages/dashboard/index';

type Props = {
  rmp: GenericFetchedData<RMPInterface>;
};

function SingleProfInfo({ rmp }: Props) {
  if (typeof rmp === 'undefined' || rmp.state === 'error') {
    return null;
  }
  if (rmp.state === 'loading') {
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
          <Skeleton variant="rounded">
            <p>Visit Rate My Professors</p>
          </Skeleton>
        </Grid>
      </Grid>
    );
  }
  if (rmp.data.numRatings == 0) {
    return (
      <Grid container spacing={2} className="p-4">
        <Grid size={6}>
          <p className="text-xl font-bold">
            {rmp.data.numRatings.toLocaleString()}
          </p>
          <p>Ratings given</p>
        </Grid>
        <Grid size={12}>
          <Link
            href={
              'https://www.ratemyprofessors.com/professor/' + rmp.data.legacyId
            }
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            Visit Rate My Professors
          </Link>
        </Grid>
      </Grid>
    );
  }

  const topTags = rmp.data.teacherRatingTags
    .sort((a, b) => b.tagCount - a.tagCount)
    .slice(0, 10);

  return (
    <Grid container spacing={2} className="p-4">
      {topTags && topTags.length > 0 && (
        <Grid item size={12}>
          <p className="font-semibold">Top Tags:</p>
          <div className="flex gap-1 flex-wrap mt-2">
            {topTags.map((tag, index) => (
              <Chip
                className="text-sm bg-cornflower-50 dark:bg-cornflower-700"
                key={index}
                label={`${tag.tagName} (${tag.tagCount})`}
                // variant="outlined"
                size="small"
              />
            ))}
          </div>
        </Grid>
      )}

      <Grid size={6}>
        <p className="text-xl font-bold">{rmp.data.avgRating}</p>
        <p>Professor rating</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">{rmp.data.avgDifficulty}</p>
        <p>Difficulty</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.numRatings.toLocaleString()}
        </p>
        <p>Ratings given</p>
      </Grid>
      <Grid size={6}>
        <p className="text-xl font-bold">
          {rmp.data.wouldTakeAgainPercent.toFixed(0) + '%'}
        </p>
        <p>Would take again</p>
      </Grid>

      <Grid size={12}>
        <Link
          href={
            'https://www.ratemyprofessors.com/professor/' + rmp.data.legacyId
          }
          target="_blank"
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Visit Rate My Professors
        </Link>
      </Grid>
    </Grid>
  );
}

export default SingleProfInfo;
