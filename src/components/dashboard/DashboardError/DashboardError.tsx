import { Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

function DashboardError() {
  const router = useRouter();

  return (
    <div className="mt-8 flex flex-col items-center">
      <Typography
        variant="h2"
        gutterBottom
        className="text-gray-600 dark:text-gray-400 font-semibold"
      >
        Error fetching results
      </Typography>
      <Button 
        variant="outlined"
        className="text-royal dark:text-cornflower-300 border-royal dark:border-cornflower-300
          hover:bg-royal/10 dark:hover:bg-cornflower-300/10"
        onClick={() => router.reload()}
      >
        Reload the page
      </Button>
    </div>
  );
}

export default DashboardError;
