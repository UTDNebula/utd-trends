import { Chip, Grid, Skeleton } from '@mui/material';
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
        <Grid item xs={6}>
          <p className="text-xl font-bold">
            <Skeleton variant="rounded" width="10%" height={25} />
          </p>
          <p>Professor rating</p>
        </Grid>
        <Grid item xs={6}>
          <p className="text-xl font-bold">
            <Skeleton variant="rounded" width="10%" height={25} />
          </p>
          <p>Difficulty</p>
        </Grid>
        <Grid item xs={6}>
          <p className="text-xl font-bold">
            <Skeleton variant="rounded" width="10%" height={25} />
          </p>
          <p>Ratings given</p>
        </Grid>
        <Grid item xs={6}>
          <p className="text-xl font-bold">
            <Skeleton variant="rounded" width="10%" height={25} />
          </p>
          <p>Would take again</p>
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
        <Grid item xs={12}>
          <p className="font-semibold">Top Tags:</p>
          <div className="flex gap-1 flex-wrap mt-2">
            {topTags.map((tag, index) => (
              <Chip
                key={index}
                label={`${tag.tagName} (${tag.tagCount})`}
                variant="outlined"
                size="small"
              />
            ))}
          </div>
        </Grid>
      )}

      <Grid item xs={6}>
        <p className="text-xl font-bold">{rmp.data.avgRating}</p>
        <p>Professor rating</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">{rmp.data.avgDifficulty}</p>
        <p>Difficulty</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmp.data.numRatings.toLocaleString()}
        </p>
        <p>Ratings given</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmp.data.wouldTakeAgainPercent.toFixed(0) + '%'}
        </p>
        <p>Would take again</p>
      </Grid>

      <Grid item xs={12}>
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
