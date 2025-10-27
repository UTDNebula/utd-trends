'use client';

import { Alert, Snackbar, Typography } from '@mui/material';
import React, { useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerCard, {
  LoadingPlannerCard,
} from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { displaySemesterName } from '@/modules/semesters';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryEqual,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import { useSearchresults } from '@/modules/plannerFetch';

export function LoadingPlannerCoursesTable() {
  const { planner } = useSharedState();

  return (
    <>
      <Typography variant="h2" className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0">
        {planner.map((_, index) => (
          <LoadingPlannerCard key={index} />
        ))}
      </div>
    </>
  );
}

export default function PlannerCoursesTable() {
  const {
    planner,
    removeFromPlanner,
    setPlannerSection,
    plannerColorMap,
    latestSemester,
  } = useSharedState();

  const [openConflictMessage, setOpenConflictMessage] = useState(false);
  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenConflictMessage(false);
  };
  const allResults = useSearchresults(planner);
  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === latestSemester,
        )
      : [],
  );
  return (
    <>
      <Typography variant="h2" className="leading-tight text-3xl font-bold p-4">
        {'My Planner' +
          (typeof latestSemester !== 'undefined' &&
            ' — ' + displaySemesterName(latestSemester, false))}
      </Typography>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0">
        {planner
          .toSorted((query1, query2) => {
            return searchQueryLabel(removeSection(query1)).localeCompare(
              searchQueryLabel(removeSection(query2)),
            );
          })
          .map((query) => {
            return (
              <PlannerCard
                key={searchQueryLabel(query)}
                query={query}
                setPlannerSection={setPlannerSection}
                removeFromPlanner={() => {
                  removeFromPlanner(query);
                }}
                selectedSections={planner
                  .map((searchQuery) =>
                    searchQueryMultiSectionSplit(searchQuery),
                  )
                  .flatMap((queries, idx) => {
                    return queries.map((query) => {
                      return latestSections[idx].find(
                        (section) =>
                          section.section_number === query.sectionNumber,
                      );
                    });
                  })
                  .filter((section) => typeof section !== 'undefined')}
                openConflictMessage={() => setOpenConflictMessage(true)}
                color={
                  plannerColorMap[searchQueryLabel(convertToCourseOnly(query))]
                }
                latestSemester={latestSemester}
              />
            );
          })}
      </div>
      <Snackbar
        open={openConflictMessage}
        autoHideDuration={6000}
        onClose={conflictMessageClose}
      >
        <Alert
          onClose={conflictMessageClose}
          severity="error"
          variant="filled"
          className="w-full"
        >
          This section conflicts with your schedule!
        </Alert>
      </Snackbar>
    </>
  );
}
