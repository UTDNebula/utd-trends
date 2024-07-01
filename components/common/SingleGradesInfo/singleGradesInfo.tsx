import { Skeleton } from '@mui/material';
import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { GradesType } from '../../../pages/dashboard/index';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

type Props = {
  course: SearchQuery;
  grades: GradesType;
  gradesLoading: 'loading' | 'done' | 'error';
};

function SingleGradesInfo({ course, grades, gradesLoading }: Props) {
  if (gradesLoading === 'error') {
    return null;
  }
  return (
    <div className="p-2">
      {gradesLoading === 'loading' ? (
        <Skeleton variant="rounded" className="w-full h-60 m-2" />
      ) : (
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
            yaxisFormatter={(value) => Number(value).toLocaleString()}
            series={[
              {
                name: searchQueryLabel(course),
                data: grades.grade_distribution,
              },
            ]}
          />
        </div>
      )}
      <div className="flex flex-wrap justify-around">
        <p>
          Grades:{' '}
          {gradesLoading === 'loading' ? (
            <Skeleton className="inline-block w-[5ch]" />
          ) : (
            <b>{grades.total.toLocaleString()}</b>
          )}
        </p>
        <p>
          GPA:{' '}
          {gradesLoading === 'loading' ? (
            <Skeleton className="inline-block w-[5ch]" />
          ) : (
            <b>{grades.gpa === -1 ? 'None' : grades.gpa.toFixed(3)}</b>
          )}
        </p>
      </div>
    </div>
  );
}

export default SingleGradesInfo;
