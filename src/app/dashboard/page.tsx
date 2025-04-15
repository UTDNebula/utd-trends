import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import Split from '@/components/common/Split/Split';
import DashboardEmpty from '@/components/dashboard/DashboardEmpty/DashboardEmpty';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import Filters from '@/components/search/Filters/Filters';
import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import { decodeSearchQueryLabel, searchQueryLabel } from '@/types/SearchQuery';

import Right, { LoadingRight } from './Right';
import ServerLeft from './ServerLeft';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Metadata {
  let title = '';
  let description =
    "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with UT Dallas grade and Rate My Professors data.";

  let searchTerms = (await searchParams).searchTerms;
  if (Array.isArray(searchTerms)) {
    searchTerms = searchTerms[0];
  }
  if (typeof searchTerms !== 'undefined') {
    const queries = searchTerms
      .split(',')
      .map(decodeSearchQueryLabel)
      .map(searchQueryLabel);
    title = ' - ' + queries.join(', ');
    description =
      'Choose the perfect classes for you: Compare ' +
      (queries.length === 1
        ? queries[0] +
          (queries[0].prefix !== 'undefined' ? ' professors' : ' courses')
        : queries.slice(0, -1).join(', ') +
          (queries.length > 2 ? ',' : '') +
          ' and ' +
          queries.slice(-1)) +
      " on Nebula Labs's data analytics platform to help you make informed decisions about your coursework with UT Dallas grade and Rate My Professors data.";
  }

  return {
    title: 'Results' + title,
    description: description,
  };
}

/**
 * Returns the results page
 */
export default async function Page({ searchParams }: Props) {
  let searchTerms = (await searchParams).searchTerms;
  if (Array.isArray(searchTerms)) {
    searchTerms = searchTerms[0];
  }
  if (typeof searchTerms === 'undefined') {
    return (
      <>
        <TopMenu isPlanner={false} />
        <main className="p-4">
          <DashboardEmpty />
        </main>
      </>
    );
  }

  searchTerms = searchTerms.split(',').map(decodeSearchQueryLabel);
  const courses = searchTerms.filter(
    (query) => typeof query.prefix !== 'undefined',
  );
  const professors = searchTerms.filter(
    (query) => typeof query.profLast !== 'undefined',
  );

  return (
    <>
      <TopMenu isPlanner={false} />
      <main className="p-4">
        <Filters />
        <Split
          left={
            <Suspense fallback={<LoadingSearchResultsTable />}>
              <ServerLeft courses={courses} professors={professors} />
            </Suspense>
          }
          right={
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto mt-4">
              <Suspense fallback={<LoadingRight />}>
                <Right courses={courses} professors={professors} />
              </Suspense>
            </div>
          }
          minLeft={40}
          minRight={30}
          defaultLeft={50}
        />
      </main>
    </>
  );
}
