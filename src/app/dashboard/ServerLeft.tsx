import React from 'react';

import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import comboTable from '@/data/combo_table.json';
import fetchGrades from '@/modules/fetchGrades';
import fetchRmp from '@/modules/fetchRmp';
import fetchSections from '@/modules/fetchSections';
import {
  convertToProfOnly,
  removeDuplicates,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/types/SearchQuery';

import ClientLeft from './ClientLeft';

//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
function fetchSearchResults(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[], //filterTerms is blank if the searchTerms are ALL courses or ALL professors
) {
  return searchTerms
    .flatMap((searchTerm) =>
      [searchTerm].concat(comboTable[searchQueryLabel(searchTerm)]),
    )
    .filter(
      (searchTerm) =>
        !filterTerms.length ||
        filterTerms.find((filterTerm) =>
          searchQueryEqual(searchTerm, filterTerm),
        ),
    );
}

interface Props {
  courses?: SearchQuery[];
  professors?: SearchQuery[];
}

export function LoadingServerLeft(props: Props) {
  let resultsLength = 20;
  if (typeof props.courses !== 'undefined' && typeof props.professors !== 'undefined') {
    let results: SearchQuery[] = [];
    if (props.courses.length > 0) {
      results = fetchSearchResults(props.courses, props.professors);
    } else if (props.professors.length > 0) {
      results = fetchSearchResults(props.professors, []);
    }
    resultsLength = results.length;
  }

  return <LoadingSearchResultsTable resultsLength={resultsLength} />;
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

  //Grade data
  //Fetch each result
  const gradesPromises = Object.fromEntries(
    results.map((result) => [searchQueryLabel(result), fetchGrades(result)]),
  );

  //RMP data
  //Get list of profs from results
  //Remove duplicates so as not to fetch multiple times
  const rmpPromises = Object.fromEntries(
    removeDuplicates(
      results
        //Remove course data from each
        .map((result) => convertToProfOnly(result))
        //Remove empty objects (used to be only course data)
        .filter((obj) => Object.keys(obj).length !== 0) as SearchQuery[],
    ).map((result) => [searchQueryLabel(result), fetchRmp(result)]),
  );

  const sectionsPromises = Object.fromEntries(
    results.map((result) => [searchQueryLabel(result), fetchSections(result)]),
  );

  const [gradesResults, rmpResults, sectionsResults] = await Promise.allSettled(
    [
      Promise.allSettled(Object.values(gradesPromises)),
      Promise.allSettled(Object.values(rmpPromises)),
      Promise.allSettled(Object.values(sectionsPromises)),
    ],
  );

  const gradesKeys = Object.keys(gradesPromises);
  const rmpKeys = Object.keys(rmpPromises);
  const sectionsKeys = Object.keys(sectionsPromises);

  const grades = Object.fromEntries(
    gradesKeys.map((key, i) => [key, gradesResults[i]]),
  );
  const rmp = Object.fromEntries(rmpKeys.map((key, i) => [key, rmpResults[i]]));
  const sections = Object.fromEntries(
    sectionsKeys.map((key, i) => [key, sectionsResults[i]]),
  );

  return (
    <ClientLeft
      numSearches={props.courses.length + props.professors.length}
      results={results}
      grades={grades}
      rmp={rmp}
      sections={sections}
    />
  );
}
