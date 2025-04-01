import { Alert, Snackbar, Typography } from '@mui/material';
import React, { useState } from 'react';

import PlannerCard, {
  LoadingRow,
} from '@/components/planner/PlannerCoursesTable/PlannerCard/PlannerCard';
import { type GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  type SearchQuery,
  searchQueryLabel,
  type SearchQueryMultiSection,
  searchQueryMultiSectionSplit,
} from '@/modules/SearchQuery/SearchQuery';
import sectionCanOverlap from '@/modules/sections/sections';
import { type SectionsType } from '@/modules/SectionsType/SectionsType';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';

type PlannerCoursesTableProps = {
  courses: SearchQueryMultiSection[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  setPlannerSection: (searchQuery: SearchQuery, section: string) => boolean;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  colorMap: { [key: string]: { fill: string; outline: string; font: string } };
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
      <Typography variant="h2" className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <div className="flex flex-col gap-4 mb-4 sm:mb-0">
        {props.courses.map((course, index) => {
          const sectionData =
            props.sections[searchQueryLabel(removeSection(course))];

          if (typeof sectionData !== 'undefined') {
            if (sectionData.state === 'loading') {
              return <LoadingRow key={index} />;
            }
          }
          return (
            <PlannerCard
              key={searchQueryLabel(removeSection(course))}
              query={course}
              sections={
                typeof sectionData === 'undefined' ||
                sectionData.state === 'error'
                  ? undefined
                  : sectionData.data.latest.filter((section) => {
                      if (
                        typeof course.profFirst === 'undefined' &&
                        typeof course.profLast === 'undefined'
                      ) {
                        return sectionCanOverlap(section.section_number);
                      } else return true;
                    })
              }
              setPlannerSection={props.setPlannerSection}
              grades={props.grades[searchQueryLabel(removeSection(course))]}
              rmp={props.rmp[searchQueryLabel(convertToProfOnly(course))]}
              removeFromPlanner={() => {
                props.removeFromPlanner(course);
              }}
              selectedSections={props.courses
                .flatMap((searchQuery) =>
                  searchQueryMultiSectionSplit(searchQuery),
                )
                .map((course) => {
                  const sections =
                    props.sections[searchQueryLabel(removeSection(course))];
                  if (
                    typeof sections === 'undefined' ||
                    sections.state !== 'done'
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
                props.colorMap[searchQueryLabel(convertToCourseOnly(course))]
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
};

export default PlannerCoursesTable;
