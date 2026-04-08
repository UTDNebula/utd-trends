'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerCard, {
  LoadingPlannerCard,
} from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { setAvailabilitySemester } from '@/modules/availability';
import { useSearchresults } from '@/modules/plannerFetch';
import { displaySemesterName } from '@/modules/semesters';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useRouter, useSearchParams } from 'next/navigation';
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
    effectiveTeachingSemester,
    setTeachingSemester,
    availableSemesters,
  } = useSharedState();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openConflictMessage, setOpenConflictMessage] = useState(false);
  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenConflictMessage(false);
  };
  const plannerForSemester = planner.filter(
    (entry) => entry.semester === effectiveTeachingSemester,
  );
  const queriesForSemester = plannerForSemester.map((e) => e.query);
  const allResults = useSearchresults(queriesForSemester);
  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === effectiveTeachingSemester,
        )
      : [],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4 pb-0">
        <Typography variant="h2" className="leading-tight text-3xl font-bold">
          {'My Planner' +
            (effectiveTeachingSemester
              ? ' — ' + displaySemesterName(effectiveTeachingSemester, false)
              : '')}
        </Typography>
        {availableSemesters.length > 0 && (
          <FormControl size="small" className="min-w-35">
            <InputLabel id="planner-teaching-semester">Semester</InputLabel>
            <Select
              labelId="planner-teaching-semester"
              label="Semester"
              size="small"
              value={effectiveTeachingSemester}
              onChange={(e: SelectChangeEvent) => {
                const newSemester = e.target.value;
                setTeachingSemester(newSemester);
                const params = new URLSearchParams(searchParams.toString());
                setAvailabilitySemester(params, newSemester);
                router.replace(`/planner?${params.toString()}`, {
                  scroll: false,
                });
              }}
              renderValue={(v) =>
                v ? displaySemesterName(v, false) : 'Select semester'
              }
              className="bg-white dark:bg-haiti"
            >
              {availableSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {displaySemesterName(sem, false)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0 pt-4">
        {plannerForSemester
          .toSorted((a, b) =>
            searchQueryLabel(removeSection(a.query)).localeCompare(
              searchQueryLabel(removeSection(b.query)),
            ),
          )
          .map((entry) => {
            const query = entry.query;
            return (
              <PlannerCard
                key={searchQueryLabel(query) + entry.semester}
                query={query}
                setPlannerSection={setPlannerSection}
                removeFromPlanner={() => {
                  removeFromPlanner(query, entry.semester);
                }}
                selectedSections={plannerForSemester
                  .map((e) => searchQueryMultiSectionSplit(e.query))
                  .flatMap((queries, idx) =>
                    queries.map((q) =>
                      latestSections[idx]?.find(
                        (section) => section.section_number === q.sectionNumber,
                      ),
                    ),
                  )
                  .filter((section) => typeof section !== 'undefined')}
                openConflictMessage={() => setOpenConflictMessage(true)}
                color={
                  plannerColorMap[searchQueryLabel(convertToCourseOnly(query))]
                }
                teachingSemester={effectiveTeachingSemester}
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
