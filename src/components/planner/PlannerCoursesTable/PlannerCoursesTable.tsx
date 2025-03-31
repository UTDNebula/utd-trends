import { Alert, Snackbar, Typography } from '@mui/material';
import React, { useState } from 'react';

import PlannerCard, {
  LoadingRow,
} from '@/components/planner/PlannerCoursesTable/PlannerCard/PlannerCard';
import { type GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToProfOnly,
  removeSection,
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import { type SectionsType } from '@/modules/SectionsType/SectionsType';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import { type SectionsData } from '@/pages/api/sections';

type PlannerCoursesTableProps = {
  courses?: SearchQuery[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  setPlannerSection: (
    searchQuery: SearchQuery,
    section: string | undefined,
  ) => boolean;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  selectedSections: SectionsData;
};

const PlannerCoursesTable = (props: PlannerCoursesTableProps) => {
  const [openConflictMessage, setOpenConflictMessage] = useState(false);
  const conflictMessageClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenConflictMessage(false);
  };

  return (
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <div className="flex flex-col gap-4">
        {props.courses
          ? props.courses.map((course, index) => {
              const sectionData =
                props.sections[searchQueryLabel(removeSection(course))];

              if (typeof sectionData !== 'undefined') {
                if (sectionData.state === 'loading') {
                  return <LoadingRow key={index} />;
                }
              }
              return (
                <PlannerCard
                  key={index}
                  query={course}
                  sections={
                    typeof sectionData === 'undefined' ||
                    sectionData.state === 'error'
                      ? undefined
                      : sectionData.data.latest
                  }
                  setPlannerSection={props.setPlannerSection}
                  grades={props.grades[searchQueryLabel(removeSection(course))]}
                  rmp={props.rmp[searchQueryLabel(convertToProfOnly(course))]}
                  removeFromPlanner={() => {
                    props.removeFromPlanner(course);
                  }}
                  selectedSections={props.selectedSections}
                  openConflictMessage={() => setOpenConflictMessage(true)}
                />
              );
            })
          : Array(5)
              .fill(0)
              .map((_, index) => <LoadingRow key={index} />)}
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
};

export default PlannerCoursesTable;
