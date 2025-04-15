import { Skeleton } from '@mui/material';
import React from 'react';

import Split from '@/components/common/Split/Split';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import { LoadingFilters } from '@/components/search/Filters/Filters';
import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';

import { LoadingRight } from './Right';

/**
 * Returns the loading results page
 */
export default function Page() {
  return (
    <>
      <TopMenu isPlanner={false} />
      <main className="p-4">
        <LoadingFilters />
        <Split
          left={<LoadingSearchResultsTable />}
          right={<LoadingRight />}
          minLeft={40}
          minRight={30}
          defaultLeft={50}
        />
      </main>
    </>
  );
}
