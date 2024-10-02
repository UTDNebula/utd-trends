import CloseIcon from '@mui/icons-material/Close';
import {
  Checkbox,
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

type GradeRowProps = {
  name: string;
  values: GenericFetchedData<GradesType>[];
  getValue: (arg0: GradesType) => number;
  formatValue: (arg0: number) => string;
  goodValue: number;
  badValue: number;
  loadingFiller: string;
  cell_className: string;
  colors: string[];
};
// This is each row of the compare table
function GradeRow({
  name,
  values,
  getValue,
  formatValue,
  goodValue,
  badValue,
  loadingFiller,
  cell_className,
  colors,
}: GradeRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right">{name}</TableCell>
      {values.map((value, index) => (
        <TableCell
          align="center"
          key={index}
          className={cell_className}
          style={{ borderColor: colors[index] }}
        >
          {((typeof value === 'undefined' || value.state === 'error') && (
            <CloseIcon />
          )) ||
            (value.state === 'loading' && (
              <Skeleton variant="rounded" className="rounded-full px-5 py-2">
                <Typography className="text-base">{loadingFiller}</Typography>
              </Skeleton>
            )) ||
            (value.state === 'done' && (
              <Typography
                className="text-base inline rounded-full px-5 py-2 text-black"
                sx={{
                  backgroundColor: colorMidpoint(
                    goodValue,
                    badValue,
                    getValue(value.data),
                  ),
                }}
              >
                {formatValue(getValue(value.data))}
              </Typography>
            )) ||
            null}
        </TableCell>
      ))}
    </TableRow>
  );
}

type RmpRowProps = {
  name: string;
  values: GenericFetchedData<RateMyProfessorData>[];
  getValue: (arg0: RateMyProfessorData) => number;
  formatValue: (arg0: number) => string;
  goodValue: number;
  badValue: number;
  loadingFiller: string;
  cell_className: string;
  colors: string[];
};
// This is each row of the compare table
function RmpRow({
  name,
  values,
  getValue,
  formatValue,
  goodValue,
  badValue,
  loadingFiller,
  cell_className,
  colors,
}: RmpRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right">{name}</TableCell>
      {values.map((value, index) => (
        <TableCell
          align="center"
          key={index}
          className={cell_className}
          style={{ borderColor: colors[index] }}
        >
          {((typeof value === 'undefined' || value.state === 'error') && (
            <CloseIcon />
          )) ||
            (value.state === 'loading' && (
              <Skeleton variant="rounded" className="rounded-full px-5 py-2">
                <Typography className="text-base">{loadingFiller}</Typography>
              </Skeleton>
            )) ||
            (value.state === 'done' && (
              <Typography
                className="text-base inline rounded-full px-5 py-2 text-black"
                sx={{
                  backgroundColor: colorMidpoint(
                    goodValue,
                    badValue,
                    getValue(value.data),
                  ),
                }}
              >
                {formatValue(getValue(value.data))}
              </Typography>
            )) ||
            null}
        </TableCell>
      ))}
    </TableRow>
  );
}

type NumRowProps = {
  name: string;
  gradeValues: GenericFetchedData<GradesType>[];
  rmpValues: GenericFetchedData<RateMyProfessorData>[];
  getGradeValue: (arg0: GradesType) => number;
  getRmpValue: (arg0: RateMyProfessorData) => number;
  loadingFiller: string;
  cell_className: string;
  colors: string[];
};
// This is each row of the compare table
function NumRow({
  name,
  gradeValues,
  rmpValues,
  getGradeValue,
  getRmpValue,
  loadingFiller,
  cell_className,
  colors,
}: NumRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right">{name}</TableCell>
      {gradeValues
        .map((x, i) => [x, rmpValues[i]])
        .map(([grade, rmp], index) => (
          <TableCell
            align="center"
            key={index}
            className={cell_className}
            style={{ borderColor: colors[index] }}
          >
            {((typeof grade === 'undefined' || grade.state === 'error') && (
              <CloseIcon />
            )) ||
              (grade.state === 'loading' && (
                <Skeleton variant="rounded" className="rounded-full px-5 py-2">
                  <Typography className="text-base">{loadingFiller}</Typography>
                </Skeleton>
              )) ||
              (grade.state === 'done' && (
                <Typography className="text-base inline">
                  {getGradeValue(grade.data as GradesType)}
                </Typography>
              )) ||
              null}
            {' / '}
            {((typeof rmp === 'undefined' || rmp.state === 'error') && (
              <CloseIcon />
            )) ||
              (rmp.state === 'loading' && (
                <Skeleton variant="rounded" className="rounded-full px-5 py-2">
                  <Typography className="text-base">{loadingFiller}</Typography>
                </Skeleton>
              )) ||
              (rmp.state === 'done' && (
                <Typography className="text-base inline">
                  {getRmpValue(rmp.data as RateMyProfessorData)}
                </Typography>
              )) ||
              null}
          </TableCell>
        ))}
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
  const mappedColors = sortedResults.map(
    (result) => colorMap[searchQueryLabel(result)],
  );

  return (
    <div className="overflow-x-auto">
      <TableContainer className="w-fit">
        <Table size="small" className="border-spacing-x-2 border-separate">
          <TableHead>
            <TableRow>
              <TableCell className="font-bold" sx={{ borderBottom: 'none' }}>
                Compare
              </TableCell>
              {sortedResults.map((result, index) => (
                <TableCell
                  key={searchQueryLabel(result)}
                  className="text-center py-3 border-x-2 border-t-2 rounded-t-lg"
                  sx={{ borderBottom: 'none' }}
                  style={{
                    background:
                      'linear-gradient(' +
                      mappedColors[index] +
                      ', transparent)',
                    borderColor: mappedColors[index],
                  }}
                >
                  <p className="[text-shadow:_0_0_4px_rgb(255_255_255_/_0.4)] dark:[text-shadow:_0_0_4px_rgb(0_0_0_/_0.4)]">
                    {searchQueryLabel(result)}
                  </p>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <GradeRow
              name="GPA"
              values={sortedResults.map(
                (result) => grades[searchQueryLabel(result)],
              )}
              getValue={(data: GradesType) => data.gpa}
              formatValue={(value: number) => value.toFixed(2)}
              goodValue={4}
              badValue={0}
              loadingFiller="4.00"
              cell_className="py-3 border-x-2"
              colors={mappedColors}
            />
            <RmpRow
              name="Rating"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RateMyProfessorData) => data.averageRating}
              formatValue={(value: number) => value.toFixed(1)}
              goodValue={5}
              badValue={0}
              loadingFiller="5.0"
              cell_className="py-3 border-x-2"
              colors={mappedColors}
            />
            <RmpRow
              name="Would Take Again"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RateMyProfessorData) =>
                data.wouldTakeAgainPercentage
              }
              formatValue={(value: number) => value.toFixed(0) + '%'}
              goodValue={100}
              badValue={0}
              loadingFiller="90%"
              cell_className="py-3 border-x-2"
              colors={mappedColors}
            />
            <RmpRow
              name="Difficulty"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RateMyProfessorData) => data.averageDifficulty}
              formatValue={(value: number) => value.toFixed(1)}
              goodValue={0}
              badValue={5}
              loadingFiller="5.0"
              cell_className="py-3 border-x-2"
              colors={mappedColors}
            />
            <NumRow
              name="# of Grades / Ratings"
              gradeValues={sortedResults.map(
                (result) => grades[searchQueryLabel(result)],
              )}
              rmpValues={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getGradeValue={(data: GradesType) => data.total}
              getRmpValue={(data: RateMyProfessorData) => data.numRatings}
              loadingFiller="100"
              cell_className="py-3 border-x-2 border-b-2 rounded-b-lg"
              colors={mappedColors}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CompareTable;
