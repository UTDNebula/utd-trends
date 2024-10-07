import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type {
  GenericFetchedData,
  GradesType,
} from '../../../pages/dashboard/index';
import { BarGraph } from '../../graph/BarGraph/BarGraph';
import CompareTable from '../CompareTable/compareTable';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RateMyProfessorData> };
  removeFromCompare: { (arg0: SearchQuery): void };
};

function convertNumbersToPercents(distribution: GradesType): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

const Compare = ({ courses, grades, rmp, removeFromCompare }: CompareProps) => {
  if (courses.length === 0) {
    return <p>Click a checkbox to add something to compare.</p>;
  }

  return (
    <>
      <div className="h-64">
        <BarGraph
          title="% of Students"
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
          series={courses.map((course) => {
            const grade = grades[searchQueryLabel(course)];
            return {
              name:
                searchQueryLabel(course) +
                ((typeof course.profFirst === 'undefined' &&
                  typeof course.profLast === 'undefined') ||
                (typeof course.prefix === 'undefined' &&
                  typeof course.number === 'undefined')
                  ? ' (Overall)' //Indicates that this entry is an aggregate for the entire course/professor
                  : ''),
              data:
                grade.state === 'done'
                  ? convertNumbersToPercents(grade.data)
                  : [],
            };
          })}
        />
      </div>
      <CompareTable
        includedResults={courses}
        grades={grades}
        rmp={rmp}
        removeFromCompare={removeFromCompare}
      />
    </>
  );
};

export default Compare;
