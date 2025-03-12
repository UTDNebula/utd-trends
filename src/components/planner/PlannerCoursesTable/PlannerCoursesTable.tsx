import { Typography } from '@mui/material';
import React from 'react';

import PlannerCard, {
  LoadingRow,
} from '@/components/planner/PlannerCoursesTable/PlannerCard/PlannerCard';
import { type GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import { type SectionsType } from '@/modules/SectionsType/SectionsType';

type PlannerCoursesTableProps = {
  courses?: SearchQuery[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
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
              const sectionData = props.sections[searchQueryLabel(course)];

              if (typeof sectionData !== 'undefined') {
                if (sectionData.state === 'error') {
                  props.removeFromPlanner(course);
                  return null;
                }
                if (sectionData.state === 'loading') {
                  return <LoadingRow key={index} />;
                }
                return (
                  <PlannerCard
                    key={index}
                    query={course}
                    sections={sectionData.data.latest}
                    removeFromPlanner={() => {
                      props.removeFromPlanner(course);
                    }}
                  />
                );
              }
            })
          : Array(5)
              .fill(0)
              .map((_, index) => <LoadingRow key={index} />)}
      </div>
    </>
  );
};

export default PlannerCoursesTable;
