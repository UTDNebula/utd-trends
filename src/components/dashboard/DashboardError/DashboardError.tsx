'use client';

import { Button, Typography } from '@mui/material';
import React from 'react';

export default function DashboardError() {
  return (
    <div className="mt-8 flex flex-col items-center">
      <Typography
        variant="h2"
        gutterBottom
        className="text-gray-600 font-semibold"
      >
        Error fetching results
      </Typography>
      <Button variant="outlined" onClick={() => window.location.reload()}>
        Reload the page
      </Button>
    </div>
  );
}
