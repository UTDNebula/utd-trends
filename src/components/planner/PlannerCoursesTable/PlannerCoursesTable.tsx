'use client';

import { Typography } from '@mui/material';
import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerCard, {
  LoadingPlannerCard,
} from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { displaySemesterName } from '@/modules/semesters';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  searchQueryLabel,
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
  const { showConflictMessage } = useSnackbar();

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
        {planner
          .toSorted((query1, query2) => {
            return searchQueryLabel(removeSection(query1)).localeCompare(
              searchQueryLabel(removeSection(query2)),
            );
          })
          .map((query, index) => {
            const sectionData =
              sections[searchQueryLabel(removeSection(query))];

            const allSections =
              typeof sectionData !== 'undefined' &&
              sectionData.message === 'success' &&
              Array.isArray(sectionData.data.all)
                ? sectionData.data.all
                : [];

            const bestSyllabusUri = allSections
              .filter(
                (s) => !!s.syllabus_uri && !!s.academic_session?.start_date,
              )
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
                openConflictMessage={showConflictMessage}
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
    </>
  );
}
