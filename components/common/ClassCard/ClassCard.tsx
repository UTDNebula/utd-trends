import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Card, Collapse, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';

import fetchWithCache, {
  cacheIndexGrades,
} from '../../../modules/fetchWithCache';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

interface ClassCardProps {
  searchQuery: SearchQuery;
  open?: boolean;
  setSemesters?: (value: string[] | ((old: string[]) => string[])) => void;
  semesters: string[] | undefined;
}

export const ClassCard = (props: ClassCardProps) => {
  const label = searchQueryLabel(props.searchQuery);

  const [open, setOpen] = useState(
    typeof props.open === 'undefined' ? false : props.open,
  );

  interface GradeData {
    _id: string;
    grade_distribution: number[];
  }
  //grade data storage
  const [data, setData] = useState<GradeData[]>([]);
  interface GradeResponse {
    message: string;
    data: GradeData[];
  }
  [];
  //fetch grade data
  useEffect(() => {
    fetchWithCache(
      '/api/grades?' +
        Object.keys(props.searchQuery)
          .map(
            (key) =>
              key +
              '=' +
              encodeURIComponent(
                String(props.searchQuery[key as keyof SearchQuery]),
              ),
          )
          .join('&'),
      cacheIndexGrades,
      604800, //1 week
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    ).then((data: GradeResponse) => {
      if (data.message !== 'success') {
        throw new Error(data.message);
        return;
      }
      if (typeof props.setSemesters !== 'undefined') {
        //add new values to semester list
        props.setSemesters((old: string[]) =>
          old
            .concat(data.data.map((semester) => semester._id))
            .filter((item, index, array) => array.indexOf(item) == index),
        );
      }
      setData(data.data);
    });
  }, []);

  //parse grade data
  const series = Array(14).fill(0);
  //sum relevant semesters
  data.forEach((semester) => {
    if (
      typeof props.semesters === 'undefined' ||
      props.semesters.includes(semester._id)
    ) {
      for (let i = 0; i < series.length; i++) {
        series[i] += semester.grade_distribution[i];
      }
    }
  });
  //sum all grades
  const total = series.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  //multiply by GPAs for weighted average
  const gpa =
    Math.round(
      ([4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0].reduce(
        (accumulator, currentValue, index) =>
          accumulator + currentValue * series[index],
        0,
      ) /
        (total - series[series.length - 1])) *
        100,
    ) / 100;
  //normalize grades to percent
  for (let i = 0; i < series.length; i++) {
    series[i] = (series[i] / total) * 100;
  }

  return (
    <Card className="m-4">
      <button
        className="w-full pt-4 px-4 pb-2 flex gap-2 items-start"
        onClick={() => setOpen((old) => !old)}
      >
        <div className="flex gap-2 flex-wrap">
          <p>{label}</p>
          <div>Add compare button here</div>
        </div>
        <IconButton className="ml-auto">
          <ExpandMoreIcon
            className={'transition-transform' + (open ? ' rotate-180' : '')}
          />
        </IconButton>
      </button>
      <div className="mx-4 mb-4">
        <Collapse in={open} className="w-full">
          <div className="h-80 w-full">
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
              yaxisFormatter={(value) => Number(value).toFixed(0) + '%'}
              series={[
                {
                  name: label,
                  data: series,
                },
              ]}
            />
          </div>
        </Collapse>
        <div className="bg-gray-200 dark:bg-gray-800 rounded p-4 flex flex-wrap justify-around ">
          <p>
            Grades: <b>{total}</b>
          </p>
          <p>
            GPA: <b>{gpa}</b>
          </p>
        </div>
        <Box className="bg-gray-200 dark:bg-gray-800 p-4">
          <div className="text-left inline-block m-0 w-1/3 pl-5">
            <p>Overall</p>
            <p className="text-2xl">4.5</p>
          </div>

          <div className="text-Sleft inline-block m-0  w-1/3 pl-5">
            <p>Grading</p>
            <p className="text-2xl">4.5</p>
          </div>

          <div className="text-left inline-block m-0  w-1/3 pl-5">
            <p>Most frequent grade</p>
            <p className="text-2xl">4.5</p>
          </div>
        </Box>
      </div>
    </Card>
  );
};

export default ClassCard;
