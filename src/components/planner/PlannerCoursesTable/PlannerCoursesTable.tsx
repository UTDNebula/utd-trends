'use client';

import { Alert, Snackbar, Typography } from '@mui/material';
import React, { useState } from 'react';

import PlannerCard, {
  LoadingPlannerCard,
} from '@/components/planner/PlannerCoursesTable/PlannerCard/PlannerCard';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  type SearchQuery,
  searchQueryLabel,
  type SearchQueryMultiSection,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import { useSharedState } from './SharedStateProvider';

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
    grades,
    rmp,
    sections,
    planner,
    addToPlanner,
    removeFromPlanner,
    setPlannerSection,
    plannerColorMap,
  } = useSharedState();

  const [openConflictMessage, setOpenConflictMessage] = useState(false);
  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenConflictMessage(false);
  };

  return (
    <>
      <Typography variant="h2" className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0">
        {planner.map((course, index) => {
          const sectionData = sections[searchQueryLabel(removeSection(course))];

          return (
            <PlannerCard
              key={index}
              query={course}
              sections={
                typeof sectionData !== 'undefined' &&
                sectionData.message === 'success'
                  ? sectionData.data.latest
                  : undefined
              }
              setPlannerSection={setPlannerSection}
              grades={grades[searchQueryLabel(removeSection(course))]}
              rmp={rmp[searchQueryLabel(convertToProfOnly(course))]}
              removeFromPlanner={() => {
                removeFromPlanner(course);
              }}
              selectedSections={planner
                .flatMap((searchQuery) =>
                  searchQueryMultiSectionSplit(searchQuery),
                )
                .map((course) => {
                  const sections =
                    sections[searchQueryLabel(removeSection(course))];
                  if (
                    typeof sections === 'undefined' ||
                    sections.message !== 'success'
                  ) {
                    return undefined;
                  }
                  return sections.data.latest.find(
                    (section) =>
                      section.section_number === course.sectionNumber,
                  );
                })
                .filter((section) => typeof section !== 'undefined')}
              openConflictMessage={() => setOpenConflictMessage(true)}
              color={
                plannerColorMap[searchQueryLabel(convertToCourseOnly(course))]
              }
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
