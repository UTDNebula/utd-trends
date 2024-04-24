import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  Skeleton,
  Typography,
} from '@mui/material';
import Link from 'next/link';
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
  const [open, setOpen] = useState(
    typeof props.open === 'undefined' ? false : props.open,
  );

  interface GradeData {
    _id: string;
    grade_distribution: number[];
  }
  //grade data storage
  const [gradeData, setGradeData] = useState<GradeData[]>([]);
  interface GradeResponse {
    message: string;
    data: GradeData[];
  }
  [];
  const [gradesState, setGradesState] = useState('loading');
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
    )
      .then((data: GradeResponse) => {
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
        setGradeData(data.data);
        setGradesState('done');
      })
      .catch((error) => {
        setGradesState('error');
        console.error('Grade Data', error);
      });
  }, []);

  //parse grade data
  const series = Array(14).fill(0);
  //sum relevant semesters
  gradeData.forEach((semester) => {
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

  //evaluation storage
  const [evalData, setEvalData] = useState<number[]>([]);
  const [evalsState, setEvalsState] = useState('loading');
  //fetch evaluation data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setEvalData([1, 2, 3]);
      setEvalsState('done');
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const label = searchQueryLabel(props.searchQuery);

  return (
    <Card className="m-4 w-3/4 max-h-full">
      <div className="flex gap-2 flex-wrap justify-start p-4">
        <p className="text-xl">{label}</p>
      </div>

      <div className="mx-4 mb-4">
        {gradesState === 'error' && (
          <Alert severity="error" className="mb-2">
            Failed to load grades
          </Alert>
        )}
        {evalsState === 'error' && (
          <Alert severity="error" className="mb-2">
            Failed to load course evaluations
          </Alert>
        )}
        <div className="mb-2 bg-gray-200 dark:bg-gray-800 rounded p-4">
          {gradesState !== 'done' ? (
            <Skeleton
              variant="rounded"
              className="h-80 w-full"
              animation={gradesState !== 'error' ? 'pulse' : false}
            />
          ) : (
            <div className="h-80 w-full">
              <BarGraph
                title="Grade Distribution"
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
          )}

          <div className="flex flex-wrap justify-around">
            <p>
              Grades:{' '}
              {gradesState !== 'done' ? (
                <Skeleton
                  variant="text"
                  className="inline-block w-[5ch]"
                  animation={gradesState !== 'error' ? 'pulse' : false}
                />
              ) : (
                <b>{total}</b>
              )}
            </p>
            <p>
              GPA:{' '}
              {gradesState !== 'done' ? (
                <Skeleton
                  variant="text"
                  className="inline-block w-[4ch]"
                  animation={gradesState !== 'error' ? 'pulse' : false}
                />
              ) : (
                <b>{gpa}</b>
              )}
            </p>
          </div>
        </div>
        <div className="inline-flex">
          <Box className="bg-gray-200 dark:bg-gray-800 rounded px-2">
            <p># of rmp ratings </p>
            <p className="flex justify-center">1000</p>
          </Box>
          <Box className="mx-3 bg-gray-200 dark:bg-gray-800 rounded px-2">
            <p>would take again</p>
            <p className="flex justify-center">6%</p>
          </Box>
        </div>
        <div className="py-2">
          <Button variant="outlined" color="info" startIcon={<AddIcon />}>
            Select for Compare
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<BookmarkBorderIcon />}
            className="mx-3"
          >
            Bookmark
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ClassCard;
