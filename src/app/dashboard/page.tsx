import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import Split from '@/components/common/Split/Split';
import StickySide from '@/components/common/Split/StickySide';
import DashboardEmpty from '@/components/dashboard/DashboardEmpty/DashboardEmpty';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import Filters, { LoadingFilters } from '@/components/search/Filters/Filters';
import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import { decodeSearchQueryLabel } from '@/types/SearchQuery';

import Right, { LoadingRight } from './Right';
import ServerLeft from './ServerLeft';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  let title = '';
  let description =
    "Choose the perfect classes for you: Nebula Labs's data analytics platform to help you make informed decisions about your coursework with UT Dallas grade and Rate My Professors data.";

  let searchTerms = (await searchParams).searchTerms;
  if (Array.isArray(searchTerms)) {
    searchTerms = searchTerms[0];
  }
  if (typeof searchTerms !== 'undefined') {
    searchTerms = decodeURIComponent(searchTerms).replaceAll('+', ' ');
    const queries = searchTerms.split(',');
    const firstIsCourse =
      typeof decodeSearchQueryLabel(queries[0]).prefix !== 'undefined';
    title = ' - ' + queries.join(', ');
    description =
      'Choose the perfect classes for you: Compare ' +
      (queries.length === 1
        ? queries[0] + (firstIsCourse ? ' professors' : ' courses')
        : queries.slice(0, -1).join(', ') +
          (queries.length > 2 ? ',' : '') +
          ' and ' +
          queries.slice(-1)) +
      " on Nebula Labs's data analytics platform to help you make informed decisions about your coursework with UT Dallas grade and Rate My Professors data.";
  }
  console.log(title);
  return {
    title: 'Results' + title,
    description: description,
    openGraph: {
      url: 'https://trends.utdnebula.com/dashboard',
    },
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
  searchTerms = decodeURIComponent(searchTerms);

  const decodedSearchTerms = searchTerms.split(',').map(decodeSearchQueryLabel);
  const courses = decodedSearchTerms.filter(
    (query) => typeof query.prefix !== 'undefined',
  );
  const professors = decodedSearchTerms.filter(
    (query) => typeof query.profLast !== 'undefined',
  );

  return (
    <>
      <TopMenu isPlanner={false} />
      <main className="p-4">
        <Suspense fallback={<LoadingFilters />}>
          <Filters />
        </Suspense>
        <Split
          left={
            <Suspense fallback={<LoadingSearchResultsTable />}>
              <ServerLeft courses={courses} professors={professors} />
            </Suspense>
          }
          right={
            <StickySide>
              <Suspense
                fallback={
                  <LoadingRight courses={courses} professors={professors} />
                }
              >
                <Right courses={courses} professors={professors} />
              </Suspense>
            </StickySide>
          }
          minLeft={40}
          minRight={30}
          defaultLeft={50}
        />
      </main>
    </>
  );
}
