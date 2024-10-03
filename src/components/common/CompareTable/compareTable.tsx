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

type GradeOrRmpRowProps<T> = {
  name: string;
  values: GenericFetchedData<T>[];
  getValue: (arg0: T) => number;
  formatValue: (arg0: number) => string;
  goodValue: number;
  badValue: number;
  loadingFiller: string;
  cell_className: string;
  colors: string[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleClick: (arg0: string) => void;
};
// This is for grade or rmp related rows in the compare table, it displays grade or rmp data for each course
function GradeOrRmpRow<T>({
  name,
  values, // data points to show with fetch state
  getValue, // basically knows what path to take to get the specific data point from the object
  formatValue, // formatting for display
  goodValue, // for gradient
  badValue,
  loadingFiller, // there is no loading in the compare component since you can't add to it until everything is loaded but nice to have
  cell_className, // for specifying border mostly
  colors, // border colors
  orderBy, // for controlling sorting
  order,
  handleClick,
}: GradeOrRmpRowProps<T>) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        <TableSortLabel
          active={orderBy === name}
          direction={orderBy === name ? order : 'asc'}
          onClick={() => {
            handleClick(name);
          }}
          sx={{
            '& .MuiTableSortLabel-icon': {
              rotate: '-90deg',
            },
          }}
        >
          {name}
        </TableSortLabel>
      </TableCell>
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
                style={{
                  backgroundColor: colorMidpoint(
                    goodValue,
                    badValue,
                    getValue(value.data),
                  ),
                }}
              >
                {/*value.data is all the data past the state of loading, done, or error.
                getValue returns the specific value from the data structure, like gpa.
                formatValue makes it look pretty like 3.7216373 displaying as 3.72.*/}
                {formatValue(getValue(value.data))}
              </Typography>
            )) ||
            null}
        </TableCell>
      ))}
    </TableRow>
  );
}

type GradeAndRmpRowProps = {
  name: string;
  gradeValues: GenericFetchedData<GradesType>[];
  rmpValues: GenericFetchedData<RateMyProfessorData>[];
  getGradeValue: (arg0: GradesType) => number;
  getRmpValue: (arg0: RateMyProfessorData) => number;
  loadingFiller: string;
  cell_className: string;
  colors: string[];
};
// This is for total data points related rows in the compare table, it displays grade and rmp data for each course
function GradeAndRmpRow({
  name,
  gradeValues, // grade data points
  rmpValues, // rmp data points
  getGradeValue, // extract specific grade related point from object
  getRmpValue, // extract specific rmp related point from object
  loadingFiller, // no loading here yet
  cell_className, // for specifying border mostly
  colors, // border colors
}: GradeAndRmpRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        {name}
      </TableCell>
      {gradeValues
        // combine values
        .map((x, i) => [x, rmpValues[i]])
        // so ts can remember the type of rmp (which it can't do for rmpValues[index]) and know's that when its state is done, you can access its data value
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
  const [orderBy, setOrderBy] = useState<string>('none');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  //Cycle through sorting
  function handleClick(col: string) {
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
      if (orderBy === 'GPA') {
        const aGrades = grades[searchQueryLabel(a)];
        const bGrades = grades[searchQueryLabel(b)];
        //drop loading/error rows to bottom
        if (
          (!aGrades || aGrades.state !== 'done') &&
          (!bGrades || bGrades.state !== 'done')
        ) {
          return 0;
        }
        if (!aGrades || aGrades.state !== 'done') {
          return 9999;
        }
        if (!bGrades || bGrades.state !== 'done') {
          return -9999;
        }
        if (order === 'asc') {
          return aGrades.data.gpa - bGrades.data.gpa;
        }
        return bGrades.data.gpa - aGrades.data.gpa;
      }
      if (
        orderBy === 'Rating' ||
        orderBy === 'Would Take Again' ||
        orderBy === 'Difficulty'
      ) {
        const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
        const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
        //drop loading/error rows to bottom
        if (
          (!aRmp || aRmp.state !== 'done') &&
          (!bRmp || bRmp.state !== 'done')
        ) {
          // If both aRmp and bRmp are not done, treat them as equal and return 0
          return 0;
        }
        if (!aRmp || aRmp.state !== 'done') {
          return 9999;
        }
        if (!bRmp || bRmp.state !== 'done') {
          return -9999;
        }
        if (orderBy === 'Rating') {
          if (order === 'asc') {
            return aRmp.data.averageRating - bRmp.data.averageRating;
          }
          return bRmp.data.averageRating - aRmp.data.averageRating;
        }
        if (orderBy === 'Would Take Again') {
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
        if (orderBy === 'Difficulty') {
          if (order === 'asc') {
            return aRmp.data.averageDifficulty - bRmp.data.averageDifficulty;
          }
          return bRmp.data.averageDifficulty - aRmp.data.averageDifficulty;
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
              <TableCell
                className="font-bold px-0 text-center"
                sx={{ borderBottom: 'none' }}
              >
                Compare
              </TableCell>
              {/*the course names along the top*/}
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
                  <p className="[text-shadow:_0_0_4px_rgb(255_255_255_/_1)] dark:[text-shadow:_0_0_4px_rgb(0_0_0_/_1)]">
                    {searchQueryLabel(result)}
                  </p>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <GradeOrRmpRow<GradesType>
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
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
            <GradeOrRmpRow<RateMyProfessorData>
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
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
            <GradeOrRmpRow<RateMyProfessorData>
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
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
            <GradeOrRmpRow<RateMyProfessorData>
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
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
            <GradeAndRmpRow
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
