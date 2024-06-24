import { Grid, LinearProgress } from '@mui/material';
import React from 'react';

import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';

type Props = {
  rmp: RateMyProfessorData;
  rmpLoading: 'loading' | 'done' | 'error';
};

function SingleProfInfo({ rmp, rmpLoading }: Props) {
  return (
    <>
      {rmpLoading === 'loading' && <LinearProgress />}
      {rmpLoading === 'done' && (
        <Grid container spacing={2} className="p-4">
          <Grid item xs={6}>
            <p className="text-xl font-bold">{rmp.averageRating}</p>
            <p>Professor rating</p>
          </Grid>
          <Grid item xs={6}>
            <p className="text-xl font-bold">{rmp.averageDifficulty}</p>
            <p>Difficulty</p>
          </Grid>
          <Grid item xs={6}>
            <p className="text-xl font-bold">
              {rmp.numRatings.toLocaleString()}
            </p>
            <p>Ratings given</p>
          </Grid>
          <Grid item xs={6}>
            <p className="text-xl font-bold">
              {rmp.wouldTakeAgainPercentage.toFixed(0) + '%'}
            </p>
            <p>Would take again</p>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default SingleProfInfo;
