import React from 'react';

import CompareTable from '@/components/compare/CompareTable/CompareTable';
import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { GradesType } from '@/types/GradesType';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  removeFromCompare: { (arg0: SearchQuery): void };
  colorMap: { [key: string]: string };
};

function convertNumbersToPercents(distribution: GradesType): number[] {
  const total = distribution.filtered.total;
  return distribution.filtered.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

const Compare = ({
  courses,
  grades,
  rmp,
  removeFromCompare,
  colorMap,
}: CompareProps) => {
  if (courses.length === 0) {
    return <p>Click a checkbox to add something to compare.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <GraphToggle
        state="done"
        bar={
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
            yaxisFormatter={(value) =>
              Number(value).toFixed(0).toLocaleString() + '%'
            }
            tooltipFormatter={(value, { seriesIndex, dataPointIndex }) => {
              let response = Number(value).toFixed(2).toLocaleString() + '%';
              const grade = grades[searchQueryLabel(courses[seriesIndex])];
              if (grade.state === 'done') {
                response +=
                  ' (' +
                  grade.data.filtered.grade_distribution[dataPointIndex]
                    .toFixed(0)
                    .toLocaleString() +
                  ')';
              }
              return response;
            }}
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
        }
        line={
          <LineGraph
            title="GPA Trends"
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
                data: grade.state === 'done' ? grade.data.grades : [],
              };
            })}
          />
        }
      />
      <CompareTable
        includedResults={courses}
        grades={grades}
        rmp={rmp}
        removeFromCompare={removeFromCompare}
        colorMap={colorMap}
      />
    </div>
  );
};

export default Compare;
