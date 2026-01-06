'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import SearchResultsTable from '@/components/search/SearchResultsTable/SearchResultsTable';
import { calculateGrades } from '@/modules/fetchGrades';
import { type SearchResult } from '@/types/SearchQuery';
import { useSearchParams } from 'next/navigation';
import React, { use, useMemo } from 'react';
import { FiltersContext } from './FilterContext';
import { matchSectionTypesFromSectionNumber } from '@/modules/semesters';

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
  const includedResults: SearchResult[] = [];
  const secondaryIncludedResults: SearchResult[] = [];
  let unIncludedResults: SearchResult[] = [];

  //Filters
  const minGPA = searchParams.get('minGPA');
  const minRating = searchParams.get('minRating');
  const maxDiff = searchParams.get('maxDiff');
  const availability = searchParams.get('availability') === 'true';

  const results = use(props.resultsPromise);
  const semesters = use(FiltersContext).semesters;
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  const sectionTypes = use(FiltersContext).sectionTypes;
  const filteredResults = useMemo(
    () =>
      results.filter((result) => {
        if (
          typeof minGPA === 'string' &&
          calculateGrades(result.grades, chosenSemesters, chosenSectionTypes)
            .gpa < parseFloat(minGPA)
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
    [results, minGPA, minRating, maxDiff, chosenSemesters, chosenSectionTypes],
  );

  //Filter results based on gpa, rmp, and rmp difficulty
  const availableResults = filteredResults.filter((result) => {
    const availableThisSemester = result.sections.some(
      (section) => section.academic_session.name === latestSemester,
    );
    if (availability && !availableThisSemester) return false;
    const hasChosenSectionTypes = result.grades.some((section) =>
      section.data.some((s) => chosenSectionTypes.includes(s.type)),
    );
    const hasChosenSemester = result.grades.some((s) =>
      chosenSemesters.includes(s._id),
    );
    if (
      !availability &&
      (!hasChosenSemester || !hasChosenSectionTypes) &&
      result.grades.length !== 0
    )
      return false;
    return true;
  });
  // for all "available" results, check if section types are available
  const sectionTypeFiltering = chosenSectionTypes.length < sectionTypes.length;
  availableResults.forEach((result) => {
    const sectionsWithTypeNextSem = result.sections.filter(
      (section) =>
        section.academic_session.name === latestSemester &&
        matchSectionTypesFromSectionNumber(
          section.section_number,
          chosenSectionTypes,
        ),
    );
    if (
      availability &&
      sectionTypeFiltering &&
      sectionsWithTypeNextSem.length == 0
    ) {
      secondaryIncludedResults.push(result);
    } else {
      // if not filtered out by section filters
      includedResults.push(result);
    }
  });
  unIncludedResults = filteredResults.filter((result) => {
    if (!availability) return false;
    const availableThisSemester =
      result.sections.filter(
        (section) => section.academic_session.name === latestSemester,
      ).length > 0;
    if (availability && availableThisSemester) return false;
    const hasChosenSemester = result.grades.some((s) =>
      chosenSemesters.includes(s._id),
    );
    const hasChosenSectionTypes = result.grades.some((section) =>
      section.data.some((s) => chosenSectionTypes.includes(s.type)),
    );
    if (
      (!hasChosenSemester || !hasChosenSectionTypes) &&
      !(
        result.grades.length == 0 &&
        chosenSemesters.length == semesters.length &&
        chosenSectionTypes.length == sectionTypes.length
      )
    )
      return false;
    return true;
  });

  return (
    <SearchResultsTable
      numSearches={props.numSearches}
      includedResults={includedResults}
      secondaryIncludedResults={secondaryIncludedResults}
      unIncludedResults={unIncludedResults}
    />
  );
}
