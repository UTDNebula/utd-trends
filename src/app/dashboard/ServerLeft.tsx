import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import { type SearchQuery, type SearchResult } from '@/types/SearchQuery';
import React, { Suspense } from 'react';
import ClientLeft from './ClientLeft';

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
  searchResultsPromise: Promise<SearchResult[]>;
}

/**
 * Returns the left side
 */
export default async function ServerLeft(props: Props) {
  // gets what are search results should be WITHOUT the associated data

  return (
    <>
      <Suspense fallback={<LoadingSearchResultsTable />}>
        <ClientLeft
          numSearches={props.courses.length + props.professors.length}
          resultsPromise={props.searchResultsPromise}
        />
      </Suspense>
    </>
  );
}
