import React, { Suspense } from 'react';

import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import rawComboTable from '@/data/combo_table.json';
import fetchAll from '@/modules/fetchAll';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/types/SearchQuery';

import ClientLeft from './ClientLeft';
import SyncServerDataToContext from './SyncServerDataToContext';

const comboTable = rawComboTable as { [key: string]: SearchQuery[] };

//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
function fetchSearchResults(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[], //filterTerms is blank if the searchTerms are ALL courses or ALL professors
) {
  return searchTerms
    .flatMap((searchTerm) =>
      [searchTerm].concat(
        comboTable[searchQueryLabel(searchTerm)].map((combo) => ({
          ...searchTerm,
          ...combo,
        })),
      ),
    )
    .filter(
      (searchTerm) =>
        !filterTerms.length ||
        filterTerms.find(
          (filterTerm) =>
            searchQueryEqual(convertToCourseOnly(searchTerm), filterTerm) ||
            searchQueryEqual(convertToProfOnly(searchTerm), filterTerm),
        ),
    );
}

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
}

/**
 * Returns the left side
 */
export default async function ServerLeft(props: Props) {
  let results: SearchQuery[] = [];
  if (props.courses.length > 0) {
    results = fetchSearchResults(props.courses, props.professors);
  } else if (props.professors.length > 0) {
    results = fetchSearchResults(props.professors, []);
  }

  const { grades, rmp, sections } = await fetchAll(results);

  return (
    <>
      <SyncServerDataToContext grades={grades} rmp={rmp} sections={sections} />
      <Suspense fallback={<LoadingSearchResultsTable />}>
        <ClientLeft
          numSearches={props.courses.length + props.professors.length}
          results={results}
        />
      </Suspense>
    </>
  );
}
