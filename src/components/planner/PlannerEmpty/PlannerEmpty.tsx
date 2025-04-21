import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { Typography } from '@mui/material';
import React from 'react';

export default function MyPlannerEmpty() {
  return (
    <>
      <Typography variant="h2" className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <Typography variant="h3" className="text-2xl p-4">
        {'Add a course on the search results page with the '}
        <BookOutlinedIcon className="text-2xl" />
        {' icon.'}
      </Typography>
    </>
  );
}
