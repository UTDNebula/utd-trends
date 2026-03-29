'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerCard, {
  LoadingPlannerCard,
} from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { useSearchresults } from '@/modules/plannerFetch';
import { generateOptimalSchedule } from '@/modules/scheduleGenerator'; // Import your new function
import { displaySemesterName } from '@/modules/semesters';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
  type SearchQuery,
} from '@/types/SearchQuery';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Added Icon
import { Alert, Button, Snackbar, Typography } from '@mui/material'; // Added Button

import React, { useState } from 'react';

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
  const [autoScheduleResultMessage, setAutoScheduleResultMessage] =
    useState('');

  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpenConflictMessage(false);
  };

  const allResults = useSearchresults(planner);
  const isLoading = allResults.some((r) => !r.isSuccess);

  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === latestSemester,
        )
      : [],
  );

  // Auto-Schedule Handler
  const handleGenerateSchedule = () => {
    if (isLoading) return;

    const { newAssignments, stoppedEarly } = generateOptimalSchedule(
      planner,
      allResults,
      latestSemester,
    );

    if (newAssignments.length === 0) {
      setAutoScheduleResultMessage(
        'No new non-conflicting sections could be added to your schedule.',
      );
    } else {
      newAssignments.forEach((assignment) => {
        const comboQuery = {
          prefix: assignment.section.course_details![0].subject_prefix,
          number: assignment.section.course_details![0].course_number,
          profFirst:
            assignment.section.professor_details &&
            assignment.section.professor_details[0]
              ? assignment.section.professor_details[0].first_name
              : undefined,
          profLast:
            assignment.section.professor_details &&
            assignment.section.professor_details[0]
              ? assignment.section.professor_details[0].last_name
              : undefined,
        } as SearchQuery;

        setPlannerSection(comboQuery, assignment.section.section_number);
      });

      setAutoScheduleResultMessage(
        `Successfully scheduled ${newAssignments.length} new course${newAssignments.length > 1 ? 's' : ''}! ${
          stoppedEarly ? '(Select different sections and try again)' : ''
        }`,
      );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 gap-4">
        <Typography variant="h2" className="leading-tight text-3xl font-bold">
          {'My Planner' +
            (typeof latestSemester !== 'undefined' &&
              ' — ' + displaySemesterName(latestSemester, false))}
        </Typography>

        <Button
          variant="contained"
          startIcon={<AutoFixHighIcon />}
          onClick={handleGenerateSchedule}
          disabled={isLoading || planner.length === 0}
          className="bg-royal dark:bg-cornflower-300 normal-case rounded-full whitespace-nowrap"
        >
          Auto-Schedule
        </Button>
      </div>
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

      {/* Auto-Schedule notification snackbar */}
      <Snackbar
        open={!!autoScheduleResultMessage}
        autoHideDuration={3000}
        onClose={() => setAutoScheduleResultMessage('')}
      >
        <Alert
          onClose={() => setAutoScheduleResultMessage('')}
          severity={
            autoScheduleResultMessage.includes('No new') ? 'warning' : 'success'
          }
          variant="filled"
          className="w-full"
        >
          {autoScheduleResultMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
