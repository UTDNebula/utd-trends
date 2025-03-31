import { Typography } from '@mui/material';
import React from 'react';

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
  type SearchQueryMultiSection,
} from '@/modules/SearchQuery/SearchQuery';
import sectionCanOverlap from '@/modules/sections/sections';
import { type SectionsType } from '@/modules/SectionsType/SectionsType';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';

type PlannerCoursesTableProps = {
  courses?: SearchQueryMultiSection[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  setPlannerSection: (searchQuery: SearchQuery, section: string) => boolean;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
};

const PlannerCoursesTable = (props: PlannerCoursesTableProps) => {
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
                />
              );
            })
          : Array(5)
              .fill(0)
              .map((_, index) => <LoadingRow key={index} />)}
      </div>
    </>
  );
};

export default PlannerCoursesTable;
