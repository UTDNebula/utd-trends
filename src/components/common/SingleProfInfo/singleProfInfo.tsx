import { Grid, Skeleton } from '@mui/material';
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
  return (
    <Grid container spacing={2} className="p-4">
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
    </Grid>
  );
}

export default SingleProfInfo;
