import { Typography } from '@mui/material';
import React from 'react';

function DashboardEmpty() {
  return (
    <Typography
      variant="h2"
      className="mt-8 text-center text-gray-600 dark:text-gray-400 font-semibold"
    >
      Search for a course or professor above
    </Typography>
  );
}

export default DashboardEmpty;
