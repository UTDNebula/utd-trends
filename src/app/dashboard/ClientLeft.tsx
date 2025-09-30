'use client';

import { useSearchParams } from 'next/navigation';
import React, { use, useMemo } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import SearchResultsTable from '@/components/search/SearchResultsTable/SearchResultsTable';
import { type SearchResult } from '@/types/SearchQuery';
import { calculateGrades } from '@/modules/fetchGrades';
import { ChosenSemesterContext } from './SemesterContext';
import { getSemestersFromSearchResults } from '@/modules/semesters';

interface Props {
  numSearches: number;
  resultsPromise: Promise<SearchResult[]>;
}

/**
 * Returns the left side
 */
export default function ClientLeft(props: Props) {
  const { latestSemester } = useSharedState();

  const searchParams = useSearchParams();

  //Filtered results
  let includedResults: SearchResult[] = [];
  let unIncludedResults: SearchResult[] = [];

  //Filters
  const minGPA = searchParams.get('minGPA');
  const minRating = searchParams.get('minRating');
  const maxDiff = searchParams.get('maxDiff');
  const availability = searchParams.get('availability') === 'true';

  const results = use(props.resultsPromise);

  const chosenSemesters =
    use(ChosenSemesterContext).chosenSemesters ??
    getSemestersFromSearchResults(results);
  const filteredResults = useMemo(
    () =>
      results.filter((result) => {
        if (
          typeof minGPA === 'string' &&
          calculateGrades(result.grades, chosenSemesters).gpa <
            parseFloat(minGPA)
        )
          return false;

        // check if this search result should have RMP data
        if (result.type !== 'course') {
          if (
            typeof minRating === 'string' &&
            result.RMP &&
            result.RMP.avgRating < parseFloat(minRating)
          )
            return false;
          if (
            typeof maxDiff === 'string' &&
            result.RMP &&
            result.RMP.avgDifficulty < parseFloat(maxDiff)
          )
            return false;
        }
        return true;
      }),
    [results, minGPA, minRating, maxDiff, chosenSemesters],
  );
  //Filter results based on gpa, rmp, and rmp difficulty
  includedResults = filteredResults.filter((result) => {
    const availableThisSemester = result.sections.some(
      (section) => section.academic_session.name === latestSemester,
    );
    if (availability && !availableThisSemester) return false;
    const hasChosenSemester = result.sections.some((s) =>
      chosenSemesters.includes(s.academic_session.name),
    );
    if (!availability && !hasChosenSemester && result.grades.length !== 0)
      return false;
    return true;
  });
  unIncludedResults = filteredResults.filter((result) => {
    if (!availability) return false;
    const availableThisSemester =
      result.sections.filter(
        (section) => section.academic_session.name === latestSemester,
      ).length > 0;
    if (availability && availableThisSemester) return false;
    const hasChosenSemester = result.sections.some((s) =>
      chosenSemesters.includes(s.academic_session.name),
    );
    if (!hasChosenSemester && result.grades.length !== 0) return false;
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
