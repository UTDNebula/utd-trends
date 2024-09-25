import CloseIcon from '@mui/icons-material/Close';
import {
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import SearchQuery, {
  convertToProfOnly,
} from '../../../modules/SearchQuery/SearchQuery';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type {
  GenericFetchedData,
  GradesType,
} from '../../../pages/dashboard/index';

//Find the color corresponding to a number in a range
function colorMidpoint(good: number, bad: number, value: number) {
  const min = bad < good ? bad : good;
  const max = bad > good ? bad : good;

  // Ensure value is within bounds
  if (value < min) value = min;
  if (value > max) value = max;

  // Normalize the value between 0 and 1
  let ratio = (value - min) / (max - min);
  if (bad > good) {
    ratio = 1 - ratio;
  }

  const startColor = { r: 0xff, g: 0x57, b: 0x57 };
  const endColor = { r: 0x79, g: 0xff, b: 0x57 };

  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

type RowProps = {
  course: SearchQuery;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RateMyProfessorData>;
  removeFromCompare: (arg0: SearchQuery) => void;
  color: string | undefined; //colorIndex
};
// This is each column of the compare table
function Row({ course, grades, rmp, removeFromCompare, color }: RowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={true}
          onClick={() => {
            removeFromCompare(course);
          }}
          sx={{
            '&.Mui-checked': {
              color: color,
            },
          }} //Colored Checkbox based on colorIndex
        />
      </TableCell>
      <TableCell align="right">
        {((typeof grades === 'undefined' || grades.state === 'error') && (
          <CloseIcon />
        )) ||
          (grades.state === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">4.00</Typography>
            </Skeleton>
          )) ||
          (grades.state === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(4, 0, grades.data.gpa) }}
            >
              {grades.data.gpa.toFixed(2)}
            </Typography>
          )) ||
          null}
      </TableCell>
      <TableCell align="right">
        {((typeof rmp === 'undefined' || rmp.state === 'error') && (
          <CloseIcon />
        )) ||
          (rmp.state === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">5.0</Typography>
            </Skeleton>
          )) ||
          (rmp.state === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{
                backgroundColor: colorMidpoint(5, 0, rmp.data.averageRating),
              }}
            >
              {rmp.data.averageRating.toFixed(1)}
            </Typography>
          )) ||
          null}
      </TableCell>
      <TableCell align="right">
        {((typeof rmp === 'undefined' || rmp.state === 'error') && (
          <CloseIcon />
        )) ||
          (rmp.state === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">5.0</Typography>
            </Skeleton>
          )) ||
          (rmp.state === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{
                backgroundColor: colorMidpoint(
                  0,
                  5,
                  rmp.data.averageDifficulty,
                ),
              }}
            >
              {rmp.data.averageDifficulty.toFixed(1)}
            </Typography>
          )) ||
          null}
      </TableCell>
      <TableCell align="right">
        {((typeof rmp === 'undefined' || rmp.state === 'error') && (
          <CloseIcon />
        )) ||
          (rmp.state === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">90%</Typography>
            </Skeleton>
          )) ||
          (rmp.state === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{
                backgroundColor: colorMidpoint(
                  100,
                  0,
                  rmp.data.wouldTakeAgainPercentage,
                ),
              }}
            >
              {rmp.data.wouldTakeAgainPercentage.toFixed(0) + '%'}
            </Typography>
          )) ||
          null}
      </TableCell>
    </TableRow>
  );
}

type CompareTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RateMyProfessorData> };
  removeFromCompare: (arg0: SearchQuery) => void;
};

const CompareTable = ({
  includedResults,
  grades,
  rmp,
  removeFromCompare,
}: CompareTableProps) => {
  //Table sorting category
  const [orderBy, setOrderBy] = useState<
    'none' | 'gpa' | 'rating' | 'difficulty' | 'would_take_again'
  >('none');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  //Cycle through sorting
  function handleClick(
    col: 'gpa' | 'rating' | 'difficulty' | 'would_take_again',
  ) {
    if (orderBy !== col) {
      setOrderBy(col);
      setOrder('asc');
    } else {
      if (order === 'asc') {
        setOrder('desc');
      } else if (order === 'desc') {
        setOrderBy('none');
      }
    }
  }

  //Sort
  let sortedResults = includedResults;
  if (orderBy !== 'none') {
    sortedResults = [...includedResults].sort((a, b) => {
      if (orderBy === 'gpa') {
        const aGrades = grades[searchQueryLabel(a)];
        const bGrades = grades[searchQueryLabel(b)];
        //drop loading/error rows to bottom
        if (aGrades.state !== 'done' && bGrades.state !== 'done') {
          return 0;
        }
        if (aGrades.state !== 'done') {
          return 9999;
        }
        if (bGrades.state !== 'done') {
          return -9999;
        }
        if (order === 'asc') {
          return aGrades.data.gpa - bGrades.data.gpa;
        }
        return bGrades.data.gpa - aGrades.data.gpa;
      }
      if (
        orderBy === 'rating' ||
        orderBy === 'difficulty' ||
        orderBy === 'would_take_again'
      ) {
        const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
        const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
        //drop loading/error rows to bottom
        if (aRmp.state !== 'done' && bRmp.state !== 'done') {
          return 0;
        }
        if (aRmp.state !== 'done') {
          return 9999;
        }
        if (bRmp.state !== 'done') {
          return -9999;
        }
        if (orderBy === 'rating') {
          if (order === 'asc') {
            return aRmp.data.averageRating - bRmp.data.averageRating;
          }
          return bRmp.data.averageRating - aRmp.data.averageRating;
        }
        if (orderBy === 'difficulty') {
          if (order === 'asc') {
            return aRmp.data.averageDifficulty - bRmp.data.averageDifficulty;
          }
          return bRmp.data.averageDifficulty - aRmp.data.averageDifficulty;
        }
        if (orderBy === 'would_take_again') {
          if (order === 'asc') {
            return (
              aRmp.data.wouldTakeAgainPercentage -
              bRmp.data.wouldTakeAgainPercentage
            );
          }
          return (
            bRmp.data.wouldTakeAgainPercentage -
            aRmp.data.wouldTakeAgainPercentage
          );
        }
      }
      return 0;
    });
  }
  // Color map for each course in the compare table based on searchQueryColors
  const colorMap: { [key: string]: string } = {};
  includedResults.forEach((result, index) => {
    colorMap[searchQueryLabel(result)] =
      searchQueryColors[index % searchQueryColors.length];
  });

  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4"></Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Compare</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'gpa'}
                  direction={orderBy === 'gpa' ? order : 'asc'}
                  onClick={() => {
                    handleClick('gpa');
                  }}
                >
                  GPA
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'rating'}
                  direction={orderBy === 'rating' ? order : 'asc'}
                  onClick={() => {
                    handleClick('rating');
                  }}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'difficulty'}
                  direction={orderBy === 'difficulty' ? order : 'asc'}
                  onClick={() => {
                    handleClick('difficulty');
                  }}
                >
                  Difficulty
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'would_take_again'}
                  direction={orderBy === 'would_take_again' ? order : 'asc'}
                  onClick={() => {
                    handleClick('would_take_again');
                  }}
                >
                  Would Take Again
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResults.map(
              (
                result //update rows with sortedResults
              ) => (
                <Row
                  key={searchQueryLabel(result)}
                  course={result}
                  grades={grades[searchQueryLabel(result)]}
                  rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                  removeFromCompare={removeFromCompare}
                  color={colorMap[searchQueryLabel(result)]}
                />
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CompareTable;
