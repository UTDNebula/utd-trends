import { Skeleton } from '@mui/material';
import React from 'react';

import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';

function convertNumbersToPercents(
  distribution: GradesType,
  gradesToUse: 'filtered' | 'unfiltered',
): number[] {
  const total = distribution[gradesToUse].total;
  return distribution[gradesToUse].grade_distribution.map(
    (frequencyOfLetterGrade) => (frequencyOfLetterGrade / total) * 100,
  );
}

type Props = {
  title?: string;
  course: SearchQuery;
  grades: GenericFetchedData<GradesType>;
  gradesToUse: 'filtered' | 'unfiltered';
};

function SingleGradesInfo({ title, course, grades, gradesToUse }: Props) {
  if (typeof grades === 'undefined' || grades.state === 'error') {
    return null;
  }

  if (grades.state === 'loading') {
    return (
      <div className="p-2">
        <GraphToggle state="loading" />
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

  const percents = convertNumbersToPercents(grades.data, gradesToUse);

  return (
    <div className="p-2">
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
                data: grades.data[gradesToUse].grade_distribution,
              },
            ]}
          />
        }
        line={
          <LineGraph
            title="GPA Trend"
            series={[
              { name: searchQueryLabel(course), data: grades.data.grades },
            ]}
          />
        }
      />
      <div className="flex flex-wrap justify-around">
        <p>
          Grades: <b>{grades.data[gradesToUse].total.toLocaleString()}</b>
        </p>
        <p>
          GPA:{' '}
          <b>
            {grades.data[gradesToUse].gpa === -1
              ? 'None'
              : grades.data[gradesToUse].gpa.toFixed(3)}
          </b>
        </p>
      </div>
    </div>
  );
}

export default SingleGradesInfo;
