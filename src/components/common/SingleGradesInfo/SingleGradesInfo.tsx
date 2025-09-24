import { Skeleton } from '@mui/material';
import React from 'react';

import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';
import type { GradesData, GradesSummary } from '@/modules/fetchGrades2';

export function LoadingSingleGradesInfo() {
  return (
    <div className="p-2">
      <GraphToggle state="loading" />
      <div className="flex flex-wrap justify-around">
        <p>
          Grades: <Skeleton className="inline-block w-[5ch]" />
        </p>
        <p>
          Median GPA: <Skeleton className="inline-block w-[5ch]" />
        </p>
        <p>
          Mean GPA: <Skeleton className="inline-block w-[5ch]" />
        </p>
      </div>
    </div>
  );
}

function convertNumbersToPercents(distribution: GradesSummary): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

type Props = {
  title?: string;
  course: SearchQuery;
  grades: GradesData;
  filteredGrades: GradesSummary;
};

export default function SingleGradesInfo({
  title,
  course,
  grades,
  filteredGrades,
}: Props) {
  const percents = convertNumbersToPercents(filteredGrades);

  return (
    <div className="p-2">
      {/* check that Grade data exists*/}
      {filteredGrades.gpa !== -1 ? (
        <GraphToggle
          state="done"
          bar={
            <BarGraph
              title={title ?? '# of Students'}
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
              yaxisFormatter={(value: number) =>
                Number(value).toFixed(0).toLocaleString()
              }
              tooltipFormatter={(
                value: number,
                { dataPointIndex }: { dataPointIndex: number },
              ) =>
                Number(value).toFixed(0).toLocaleString() +
                ' (' +
                percents[dataPointIndex].toFixed(2) +
                '%)'
              }
              series={[
                {
                  name: searchQueryLabel(course),
                  data: filteredGrades.grade_distribution,
                },
              ]}
            />
          }
          line={
            <LineGraph
              title="GPA Trend"
              series={[{ name: searchQueryLabel(course), data: grades }]}
            />
          }
        />
      ) : (
        <p className="p-1 pt-0">
          This professor/course combination hasn&apos;t been taught in the
          semesters you selected. To see more grade data, try changing your
          filters.
        </p>
      )}
      <div className="flex flex-wrap justify-around">
        <p>
          Grades: <b>{filteredGrades.total.toLocaleString()}</b>
        </p>
        <p>
          Median GPA:{' '}
          <b>
            {filteredGrades.gpa === -1
              ? 'None'
              : gpaToLetterGrade(filteredGrades.gpa)}
          </b>
        </p>
        <p>
          Mean GPA:{' '}
          <b>
            {filteredGrades.mean_gpa === -1
              ? 'None'
              : filteredGrades.mean_gpa.toFixed(3)}
          </b>
        </p>
      </div>
    </div>
  );
}
