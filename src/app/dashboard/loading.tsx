import Split from '@/components/common/Split/Split';
import StickySide from '@/components/common/Split/StickySide';
import Header from '@/components/navigation/Header/Header';
import { LoadingFilters } from '@/components/search/Filters/Filters';
import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import React from 'react';
import { LoadingRight } from './Right';

/**
 * Returns the loading results page
 */
export default function Page() {
  return (
    <>
      <Header isPlanner={false} />
      <main className="p-4">
        <LoadingFilters />
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <Split
            left={<LoadingSearchResultsTable />}
            right={
              <StickySide>
                <LoadingRight />
              </StickySide>
            }
            minLeft="40%"
            minRight="30%"
            defaultLeft="50%"
          />
        </div>

        {/* Mobile Layout */}
        <div className="block md:hidden mt-4">
          <LoadingRight isMobile={true} />
        </div>
      </main>
    </>
  );
}
