import { Skeleton } from '@mui/material';
import React from 'react';

import BarGraph from '@/components/graph/BarGraph/BarGraph';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { GenericFetchedData, GradesType } from '@/pages/dashboard/index';

function convertNumbersToPercents(distribution: GradesType): number[] {
  const total = distribution.total;
  return distribution.grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

type Props = {
  title?: string;
  course: SearchQuery;
  grades: GenericFetchedData<GradesType>;
};

function SingleGradesInfo({ title, course, grades }: Props) {
  if (typeof grades === 'undefined' || grades.state === 'error') {
    return null;
  }
  if (grades.state === 'loading') {
    return (
      <div className="p-2">
        <Skeleton variant="rounded" className="w-full h-60 m-2" />
        <div className="flex flex-wrap justify-around">
          <p>
            Grades: <Skeleton className="inline-block w-[5ch]" />
          </p>
          <p>
            GPA: <Skeleton className="inline-block w-[5ch]" />
          </p>
        </div>
      </div>
    );
  }

  const percents = convertNumbersToPercents(grades.data);

  return (
    <div className="p-2">
      <div className="h-64">
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
          yaxisFormatter={(value) => Number(value).toFixed(0).toLocaleString()}
          tooltipFormatter={(value, { dataPointIndex }) =>
            Number(value).toFixed(0).toLocaleString() +
            ' (' +
            percents[dataPointIndex].toFixed(2) +
            '%)'
          }
          series={[
            {
              name: searchQueryLabel(course),
              data: grades.data.grade_distribution,
            },
          ]}
        />
      </div>
      <div className="flex flex-wrap justify-around">
        <p>
          Grades: <b>{grades.data.total.toLocaleString()}</b>
        </p>
        <p>
          GPA:{' '}
          <b>{grades.data.gpa === -1 ? 'None' : grades.data.gpa.toFixed(3)}</b>
        </p>
      </div>
    </div>
  );
}

export default SingleGradesInfo;
