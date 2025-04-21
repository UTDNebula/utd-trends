'use client';

import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import CompareTable from '@/components/compare/CompareTable/CompareTable';
import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import type { Grades } from '@/modules/fetchGrades';
import { searchQueryLabel } from '@/types/SearchQuery';

function convertNumbersToPercents(distribution: Grades): number[] {
  const total = distribution.filtered.total;
  return distribution.filtered.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

export default function Compare() {
  const {
    compare,
    removeFromCompare,
    compareGrades,
    compareRmp,
    compareColorMap,
  } = useSharedState();

  if (compare.length === 0) {
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
              const grade =
                compareGrades[searchQueryLabel(compare[seriesIndex])];
              if (grade.message === 'success') {
                response +=
                  ' (' +
                  grade.data.filtered.grade_distribution[dataPointIndex]
                    .toFixed(0)
                    .toLocaleString() +
                  ')';
              }
              return response;
            }}
            series={compare.map((course) => {
              const grade = compareGrades[searchQueryLabel(course)];
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
                  grade.message === 'success'
                    ? convertNumbersToPercents(grade.data)
                    : [],
              };
            })}
          />
        }
        line={
          <LineGraph
            title="GPA Trends"
            series={compare.map((course) => {
              const grade = compareGrades[searchQueryLabel(course)];
              return {
                name:
                  searchQueryLabel(course) +
                  ((typeof course.profFirst === 'undefined' &&
                    typeof course.profLast === 'undefined') ||
                  (typeof course.prefix === 'undefined' &&
                    typeof course.number === 'undefined')
                    ? ' (Overall)' //Indicates that this entry is an aggregate for the entire course/professor
                    : ''),
                data: grade.message === 'success' ? grade.data.grades : [],
              };
            })}
          />
        }
      />
      <CompareTable
        includedResults={compare}
        grades={compareGrades}
        rmp={compareRmp}
        removeFromCompare={removeFromCompare}
        colorMap={compareColorMap}
      />
    </div>
  );
}
