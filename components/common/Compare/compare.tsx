import React from 'react';

import SearchQuery, {
  convertToProfOnly,
} from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';
import { BarGraph } from '../../graph/BarGraph/BarGraph';
import CompareTable from '../CompareTable/CompareTable';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
  gradesLoading: { [key: string]: 'loading' | 'done' | 'error' };
  rmpLoading: { [key: string]: 'loading' | 'done' | 'error' };
  addToCompare: { (arg0: SearchQuery): void };
  removeFromCompare: { (arg0: SearchQuery): void };
};

function convertNumbersToPercents(distribution: GradesType): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

const Compare = ({
  courses,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
  addToCompare,
  removeFromCompare,
}: CompareProps) => {
  // console.log(courses, grades, rmp, gradesLoading, rmpLoading);
  return (
    <>
      <div className="h-64">
        <BarGraph
          title="Grades"
          xaxisLabels={[
            'A+',
            'A',
            'A-',
            'B+',
            'B',
            'B-',
            'C+',
            'C',
            'C-',
            'D+',
            'D',
            'D-',
            'F',
            'W',
          ]}
          yaxisFormatter={(value) => Number(value).toLocaleString() + '%'}
          series={courses.map((course, index) => ({
            name: searchQueryLabel(course),
            data: grades[searchQueryLabel(course)]
              ? convertNumbersToPercents(grades[searchQueryLabel(course)])
              : [],
          }))}
        />
      </div>
      <CompareTable
        resultsLoading={
          courses.every(
            (course) =>
              gradesLoading[searchQueryLabel(course)] === 'done' &&
              (rmpLoading[searchQueryLabel(convertToProfOnly(course))] ===
                'done' ||
                typeof rmpLoading[
                  searchQueryLabel(convertToProfOnly(course))
                ] === 'undefined'),
          )
            ? 'done'
            : 'loading'
        } //*
        includedResults={courses}
        grades={grades}
        rmp={rmp}
        gradesLoading={gradesLoading}
        rmpLoading={rmpLoading}
        compare={courses} //*
        addToCompare={addToCompare}
        removeFromCompare={removeFromCompare}
      />
    </>
  );
};

export default Compare;
