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

import React, { useEffect, useRef, useState } from 'react';

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
  const [showAutoScheduleSnackbar, setShowAutoScheduleSnackbar] =
    useState(false);
  const [autoScheduleResultMessage, setAutoScheduleResultMessage] =
    useState('');
  const [lastAssignments, setLastAssignments] = useState<
    { query: SearchQuery; sectionNumber: string }[]
  >([]); // for undo
  const isUndoAction = useRef(false);

  useEffect(() => {
    // if user manually changes courses in planner by other means
    if (!isUndoAction.current && lastAssignments.length > 0) {
      setLastAssignments([]); // disable undo
      setShowAutoScheduleSnackbar(false);
    }
  }, [planner, lastAssignments.length]);

  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpenConflictMessage(false);
  };
  const autoScheduleResultMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setShowAutoScheduleSnackbar(false);
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

  // undo an auto-schedule
  const handleUndoSchedule = () => {
    isUndoAction.current = true; // UNLOCK planner modifications via undo

    lastAssignments.forEach((assignment) => {
      setPlannerSection(assignment.query, assignment.sectionNumber); // un-toggle
    });

    setLastAssignments([]); // not a long-term undo history
    setShowAutoScheduleSnackbar(false);

    // LOCK undo updates after batched state updates
    setTimeout(() => {
      isUndoAction.current = false;
    }, 100);
  };

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
      setLastAssignments([]); // no need to undo
    } else {
      isUndoAction.current = true; // UNLOCK planner modifications via undo
      const appliedAssignments: {
        query: SearchQuery;
        sectionNumber: string;
      }[] = []; // track assignments about to be added for undo

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

        appliedAssignments.push({
          query: comboQuery,
          sectionNumber: assignment.section.section_number,
        });
        setPlannerSection(comboQuery, assignment.section.section_number);
      });

      setLastAssignments(appliedAssignments); // save auto-filled assignments for undo

      setAutoScheduleResultMessage(
        `Successfully scheduled ${newAssignments.length} new course${newAssignments.length > 1 ? 's' : ''}! ${
          stoppedEarly ? '(Select different sections and try again)' : ''
        }`,
      );

      // LOCK undo updates after batched state updates
      setTimeout(() => {
        isUndoAction.current = false;
      }, 100);
    }
    setShowAutoScheduleSnackbar(true);
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
          onClick={
            lastAssignments.length > 0
              ? handleUndoSchedule
              : handleGenerateSchedule
          }
          disabled={isLoading || planner.length === 0}
          className="bg-royal dark:bg-cornflower-300 normal-case rounded-full whitespace-nowrap"
        >
          {lastAssignments.length > 0 ? 'Undo Changes' : 'Auto-Schedule'}
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
        open={showAutoScheduleSnackbar}
        autoHideDuration={3000}
        onClose={autoScheduleResultMessageClose}
      >
        <Alert
          severity={
            autoScheduleResultMessage.includes('No new') ? 'warning' : 'success'
          }
          variant="filled"
          className="w-full"
          onClose={autoScheduleResultMessageClose}
          action={
            lastAssignments.length > 0 && (
              <Button color="inherit" size="small" onClick={handleUndoSchedule}>
                UNDO
              </Button>
            )
          }
        >
          {autoScheduleResultMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
