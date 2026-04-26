import { type SearchQuery, type SearchResult } from '@/types/SearchQuery';
import React from 'react';
import ClientLeft from './ClientLeft';

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
  searchResultsPromise: Promise<SearchResult[]>;
}

/**
 * Returns the left side
 */
export default function ServerLeft(props: Props) {
  return (
    <ClientLeft
      numSearches={props.courses.length + props.professors.length}
      resultsPromise={props.searchResultsPromise}
    />
  );
}
