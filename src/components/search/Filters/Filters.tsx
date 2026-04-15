'use client';

import { FiltersContext } from '@/app/dashboard/FilterContext';
import { useSharedState } from '@/app/SharedStateProvider';
import type { SearchResult } from '@/types/SearchQuery';
import { Grid, Skeleton } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import React, { use } from 'react';
import AvailabilityFilterChip from './Chips/AvailabilityFilterChip';
import MinLetterGradeFilterChip from './Chips/MinLetterGradeFilterChip';
import MinRatingFilterChip from './Chips/MinRatingFilterChip';
import SectionTypeFilterChip from './Chips/SectionTypeFilterChip';
import SemesterFilterChip from './Chips/SemesterFilterChip';

export function LoadingFilters() {
  const ChipSkeleton = (
    <Skeleton
      variant="rectangular"
      className="rounded-full"
      height={32}
      width={128}
    />
  );

  return (
    <Grid container spacing={{ xs: 1, md: 2 }} className="mb-4 sm:m-0">
      {ChipSkeleton} {/* Min Letter Grade */}
      {ChipSkeleton} {/* Min Rating */}
      {ChipSkeleton} {/* Semesters */}
      {ChipSkeleton} {/* Section Types */}
      {ChipSkeleton} {/* Availability */}
    </Grid>
  );
}

/**
 * This component returns a set of filters with which to sort results.
 */
export default function Filters({
  searchResultsPromise,
}: {
  searchResultsPromise: Promise<SearchResult[]>;
}) {
  const { latestSemester } = useSharedState();
  const searchResults = use(searchResultsPromise);
  const semesters = use(FiltersContext).semesters;
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const setChosenSemesters = use(FiltersContext).setChosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  const setChosenSectionTypes = use(FiltersContext).setChosenSectionTypes;
  const sectionTypes = use(FiltersContext).sectionTypes;

  const searchParams = useSearchParams();

  let minGPA = searchParams.get('minGPA') ?? '';
  if (Array.isArray(minGPA)) {
    minGPA = minGPA[0]; // if minGPA is an array, make it a string
  }
  let minRating = searchParams.get('minRating') ?? '';
  if (Array.isArray(minRating)) {
    minRating = minRating[0]; // if minRating is an array, make it a string
  }
  const filterNextSem = searchParams.get('availability') === 'true';

  const semFilteredResults = searchResults.filter((result) => {
    const availableThisSemester =
      filterNextSem &&
      result.sections.some(
        (section) => section.academic_session.name === latestSemester,
      );
    const hasChosenSectionTypes = result.grades.some((section) =>
      section.data.some((s) => chosenSectionTypes.includes(s.type)),
    );
    return (
      (result.grades.length === 0 &&
        chosenSemesters.length === semesters.length &&
        chosenSectionTypes.length === sectionTypes.length) ||
      (result.grades.some((s) => chosenSemesters.includes(s._id)) &&
        hasChosenSectionTypes) ||
      availableThisSemester
    );
  });

  return (
    <Grid
      container
      spacing={{ xs: 1, md: 2 }}
      data-tutorial-id="filters"
      className="mb-4 sm:m-0"
    >
      <MinLetterGradeFilterChip
        chosenSectionTypes={chosenSectionTypes}
        chosenSemesters={chosenSemesters}
        minGPA={minGPA}
        minRating={minRating}
        sectionTypes={sectionTypes}
        semFilteredResults={semFilteredResults}
        semesters={semesters}
      />

      <MinRatingFilterChip
        chosenSectionTypes={chosenSectionTypes}
        chosenSemesters={chosenSemesters}
        minGPA={minGPA}
        minRating={minRating}
        semFilteredResults={semFilteredResults}
      />

      <SemesterFilterChip
        semesters={semesters}
        chosenSemesters={chosenSemesters}
        setChosenSemesters={setChosenSemesters}
      />

      <SectionTypeFilterChip
        sectionTypes={sectionTypes}
        chosenSectionTypes={chosenSectionTypes}
        setChosenSectionTypes={setChosenSectionTypes}
      />

      <AvailabilityFilterChip
        filterNextSem={filterNextSem}
        latestSemester={latestSemester}
      />
    </Grid>
  );
}
