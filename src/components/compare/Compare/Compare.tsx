'use client';

import { FiltersContext } from '@/app/dashboard/FilterContext';
import { useSharedState } from '@/app/SharedStateProvider';
import CompareTable from '@/components/compare/CompareTable/CompareTable';
import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import { calculateGrades, type GradesSummary } from '@/modules/fetchGrades';
import { searchQueryLabel } from '@/types/SearchQuery';
import React, { use } from 'react';

function convertNumbersToPercents(distribution: GradesSummary): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

export default function Compare() {
  const { compare, removeFromCompare, compareColorMap } = useSharedState();
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  if (compare.length === 0) {
    return <p>Click a checkbox to add something to compare.</p>;
  }

  // Only chart courses that actually have grade data for the current filters
  const compareWithData = compare.filter((course) => {
    const categories = convertNumbersToPercents(
      calculateGrades(course.grades, chosenSemesters, chosenSectionTypes),
    );
    return !Number.isNaN(categories[0]);
  });

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
              const grade = compareWithData[seriesIndex].grades;
              response +=
                ' (' +
                calculateGrades(grade, chosenSemesters, chosenSectionTypes)
                  .grade_distribution[dataPointIndex].toFixed(0)
                  .toLocaleString() +
                ')';

              return response;
            }}
            series={compareWithData.map((course) => {
              const categories = convertNumbersToPercents(
                calculateGrades(
                  course.grades,
                  chosenSemesters,
                  chosenSectionTypes,
                ),
              );
              return {
                name:
                  searchQueryLabel(course.searchQuery) +
                  (course.type !== 'combo'
                    ? ' (Overall)' //Indicates that this entry is an aggregate for the entire course/professor
                    : ''),
                data: categories,
              };
            })}
          />
        }
        line={
          <LineGraph
            title="GPA Trends"
            series={compare.map((course) => {
              return {
                name:
                  searchQueryLabel(course.searchQuery) +
                  (course.type !== 'combo'
                    ? ' (Overall)' //Indicates that this entry is an aggregate for the entire course/professor
                    : ''),
                data: course.grades,
              };
            })}
          />
        }
      />
      <CompareTable
        includedResults={compare}
        removeFromCompare={removeFromCompare}
        colorMap={compareColorMap}
        chosenSemesters={chosenSemesters}
        chosenSectionTypes={chosenSectionTypes}
      />
    </div>
  );
}
