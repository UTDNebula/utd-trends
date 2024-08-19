import CloseIcon from '@mui/icons-material/Close';
import { Grid, Skeleton } from '@mui/material';
import React from 'react';

import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';

type Props = {
  rmp: RateMyProfessorData | undefined;
  rmpLoading: 'loading' | 'done' | 'error' | undefined;
};

function SingleProfInfo({ rmp, rmpLoading }: Props) {
  if (rmpLoading === 'error') {
    return null;
  }
  return (
    <Grid container spacing={2} className="p-4">
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmpLoading === 'loading' && <Skeleton />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && rmp.averageRating}
        </p>
        <p>Professor rating</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmpLoading === 'loading' && <Skeleton />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && rmp.averageDifficulty}
        </p>
        <p>Difficulty</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmpLoading === 'loading' && <Skeleton />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && rmp.numRatings.toLocaleString()}
        </p>
        <p>Ratings given</p>
      </Grid>
      <Grid item xs={6}>
        <p className="text-xl font-bold">
          {rmpLoading === 'loading' && <Skeleton />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' &&
            rmp.wouldTakeAgainPercentage.toFixed(0) + '%'}
        </p>
        <p>Would take again</p>
      </Grid>
    </Grid>
  );
}

export default SingleProfInfo;
