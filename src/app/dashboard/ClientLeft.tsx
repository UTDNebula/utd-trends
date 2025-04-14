'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

import SearchResultsTable from '@/components/search/SearchResultsTable/SearchResultsTable';
import { useSharedState } from './SharedStateProvider';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';

interface Props {
  numSearches: number;
  results: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<Grades> };
  rmp: { [key: string]: GenericFetchedData<RMP> };
  sections: { [key: string]: GenericFetchedData<Sections> };
}

/**
 * Returns the left side
 */
export default async function ClientLeft(props: Props) {
  const { grades, setGrades, rmp, setRmp, sections, setSections } =
    useSharedState();
  useEffect(() => {
    setGrades(props.grades);
    setRmp(props.rmp);
    setSections(props.sections);
  }, []);

  const searchParams = useSearchParams();

  //Filtered results
  let includedResults: SearchQuery[] = [];
  let unIncludedResults: SearchQuery[] = [];

  //Filter results based on gpa, rmp, and rmp difficulty
  includedResults = props.results.filter((result) => {
    //Remove if over threshold
    const courseGrades = grades[searchQueryLabel(result)];
    const courseSection = sections[searchQueryLabel(result)];
    if (
      typeof courseGrades !== 'undefined' &&
      courseGrades.message === 'success' &&
      courseGrades.data.filtered.gpa === -1 &&
      !(
        typeof courseSection !== 'undefined' &&
        courseSection.message === 'done' &&
        searchParams.get('availability') === 'true' &&
        courseSection.data.latest.length
      )
    ) {
      return false;
    }
    if (
      typeof searchParams.get('minGPA') === 'string' &&
      typeof courseGrades !== 'undefined' &&
      courseGrades.message === 'success' &&
      courseGrades.data.filtered.gpa < parseFloat(searchParams.get('minGPA'))
    ) {
      return false;
    }
    const courseRmp = rmp[searchQueryLabel(convertToProfOnly(result))];
    if (
      typeof searchParams.get('minRating') === 'string' &&
      typeof courseRmp !== 'undefined' &&
      courseRmp.message === 'success' &&
      courseRmp.data.avgRating < parseFloat(searchParams.get('minRating'))
    ) {
      return false;
    }
    if (
      typeof searchParams.get('maxDiff') === 'string' &&
      typeof courseRmp !== 'undefined' &&
      courseRmp.message === 'success' &&
      courseRmp.data.avgDifficulty > parseFloat(searchParams.get('maxDiff'))
    ) {
      return false;
    }

    if (
      searchParams.get('availability') === 'true' &&
      typeof courseSection !== 'undefined' &&
      courseSection.message === 'success' &&
      !courseSection.data.latest.length
    ) {
      return false;
    }

    return true;
  });
  unIncludedResults = props.results.filter((result) => {
    //Remove if over threshold
    const courseGrades = grades[searchQueryLabel(result)];
    if (
      typeof courseGrades !== 'undefined' &&
      courseGrades.message === 'success' &&
      courseGrades.data.filtered.gpa === -1
    ) {
      return false;
    }
    if (
      typeof searchParams.get('minGPA') === 'string' &&
      typeof courseGrades !== 'undefined' &&
      courseGrades.message === 'success' &&
      courseGrades.data.filtered.gpa < parseFloat(searchParams.get('minGPA'))
    ) {
      return false;
    }
    const courseRmp = rmp[searchQueryLabel(convertToProfOnly(result))];
    if (
      typeof searchParams.get('minRating') === 'string' &&
      typeof courseRmp !== 'undefined' &&
      courseRmp.message === 'success' &&
      courseRmp.data.avgRating < parseFloat(searchParams.get('minRating'))
    ) {
      return false;
    }
    if (
      typeof searchParams.get('maxDiff') === 'string' &&
      typeof courseRmp !== 'undefined' &&
      courseRmp.message === 'success' &&
      courseRmp.data.avgDifficulty > parseFloat(searchParams.get('maxDiff'))
    ) {
      return false;
    }
    const courseSection = sections[searchQueryLabel(result)];
    if (
      !(
        searchParams.get('availability') === 'true' &&
        typeof courseSection !== 'undefined' &&
        courseSection.message === 'success' &&
        !courseSection.data.latest.length
      )
    ) {
      return false;
    }

    return true;
  });

  return (
    <SearchResultsTable
      numSearches={props.numSearches}
      includedResults={includedResults}
      unIncludedResults={unIncludedResults}
    />
  );
}
