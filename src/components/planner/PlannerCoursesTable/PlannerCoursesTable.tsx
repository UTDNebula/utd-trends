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
  convertToProfOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';

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
    removeFromPlanner,
    setPlannerSection,
    plannerColorMap,
    courseNames,
    latestSemester,
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
        {'My Planner' +
          (typeof latestSemester !== 'undefined' &&
          latestSemester.message === 'success'
            ? ' — ' + displaySemesterName(latestSemester.data, false)
            : '')}
      </Typography>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0">
        {planner.map((query, index) => {
          const sectionData = sections[searchQueryLabel(removeSection(query))];

          const allSections =
            typeof sectionData !== 'undefined' &&
            sectionData.message === 'success' &&
            Array.isArray(sectionData.data.all)
              ? sectionData.data.all
              : [];

          const bestSyllabusUri = allSections
            .filter((s) => !!s.syllabus_uri && !!s.academic_session?.start_date)
            .sort(
              (a, b) =>
                new Date(b.academic_session.start_date).getTime() -
                new Date(a.academic_session.start_date).getTime(),
            )?.[0]?.syllabus_uri;

          return (
            <PlannerCard
              key={index}
              query={query}
              sections={
                typeof sectionData !== 'undefined' &&
                sectionData.message === 'success'
                  ? sectionData.data.latest
                  : undefined
              }
              bestSyllabus={bestSyllabusUri}
              setPlannerSection={setPlannerSection}
              grades={grades[searchQueryLabel(removeSection(query))]}
              rmp={rmp[searchQueryLabel(convertToProfOnly(query))]}
              removeFromPlanner={() => {
                removeFromPlanner(query);
              }}
              selectedSections={planner
                .flatMap((searchQuery) =>
                  searchQueryMultiSectionSplit(searchQuery),
                )
                .map((single) => {
                  const singleSectionData =
                    sections[searchQueryLabel(removeSection(single))];
                  if (
                    typeof singleSectionData === 'undefined' ||
                    singleSectionData.message !== 'success'
                  ) {
                    return undefined;
                  }
                  return singleSectionData.data?.latest.find(
                    (section) =>
                      section.section_number === single.sectionNumber,
                  );
                })
                .filter((section) => typeof section !== 'undefined')}
              openConflictMessage={() => setOpenConflictMessage(true)}
              color={
                plannerColorMap[searchQueryLabel(convertToCourseOnly(query))]
              }
              courseName={
                courseNames[searchQueryLabel(convertToCourseOnly(query))]
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
