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
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import SearchQuery, {
  convertToProfOnly,
} from '../../../modules/SearchQuery/SearchQuery';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RMPInterface } from '../../../pages/api/ratemyprofessorScraper';
import type {
  GenericFetchedData,
  GradesType,
} from '../../../pages/dashboard/index';
import TableSortLabel from '../TableSortLabel/tableSortLabel';

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
  defaultAscSort?: boolean;
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
  defaultAscSort,
}: GradeOrRmpRowProps<T>) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        <TableSortLabel
          active={orderBy === name}
          direction={orderBy === name ? order : defaultAscSort ? 'asc' : 'desc'}
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
          style={{
            borderColor: colors[index],
            backgroundColor: colors[index] + '10', // add transparency
          }}
        >
          {((typeof value === 'undefined' || value.state === 'error') && (
            <></>
          )) ||
            (value.state === 'loading' && (
              <Skeleton variant="rounded" className="rounded-full px-5 py-2">
                <Typography className="text-base">{loadingFiller}</Typography>
              </Skeleton>
            )) ||
            (value.state === 'done' && getValue(value.data) !== -1 && (
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
  rmpValues: GenericFetchedData<RMPInterface>[];
  getGradeValue: (arg0: GradesType) => number;
  getRmpValue: (arg0: RMPInterface) => number;
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
            style={{
              borderColor: colors[index],
              backgroundColor: colors[index] + '10', // add transparency
            }}
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
                  {getRmpValue(rmp.data as RMPInterface)}
                </Typography>
              )) ||
              null}
          </TableCell>
        ))}
    </TableRow>
  );
}

type CheckboxRowProps = {
  name: string;
  courses: SearchQuery[];
  removeFromCompare: (arg0: SearchQuery) => void;
  cell_className: string;
  colors: string[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleClick: (arg0: string) => void;
};
// This is for checkboxes to remove courses from the compare table
function CheckboxRow({
  name,
  courses,
  removeFromCompare, // remove course function
  cell_className, // for specifying border mostly
  colors, // border colors
  orderBy, // for controlling sorting
  order,
  handleClick,
}: CheckboxRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        <TableSortLabel
          active={orderBy === name}
          direction={orderBy === name ? order : 'desc'}
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
      {courses.map((course, index) => (
        <TableCell
          align="center"
          key={index}
          className={cell_className}
          style={{
            borderColor: colors[index],
            backgroundColor: colors[index] + '10', // add transparency
          }}
        >
          <Checkbox
            checked={true}
            onClick={() => {
              removeFromCompare(course);
            }}
            sx={{
              '&.Mui-checked': {
                color: colors[index],
              },
            }} //Colored Checkbox based on graph
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

type CompareTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RMPInterface> };
  removeFromCompare: (arg0: SearchQuery) => void;
};

const CompareTable = ({
  includedResults,
  grades,
  rmp,
  removeFromCompare,
}: CompareTableProps) => {
  //Table sorting category
  const [orderBy, setOrderBy] = useState<string>('Color');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  //Cycle through sorting
  function handleClick(col: string) {
    if (orderBy !== col) {
      setOrderBy(col);
      if (col === 'Difficulty')
        setOrder('asc'); //default difficulty behavior goes from low to high
      else setOrder('desc'); //default number behavior goes from high to low for our metrics
    } else {
      if (col !== 'Color') {
        if (order === 'desc') {
          setOrder('asc');
        } else {
          setOrder('desc');
        }
      }
    }
  }

  //Sort
  const sortedResults = [...includedResults].sort((a, b) => {
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
          return aRmp.data.avgRating - bRmp.data.avgRating;
        }
        return bRmp.data.avgRating - aRmp.data.avgRating;
      }
      if (orderBy === 'Would Take Again') {
        if (order === 'asc') {
          return (
            aRmp.data.wouldTakeAgainPercent - bRmp.data.wouldTakeAgainPercent
          );
        }
        return (
          bRmp.data.wouldTakeAgainPercent - aRmp.data.wouldTakeAgainPercent
        );
      }
      if (orderBy === 'Difficulty') {
        if (order === 'asc') {
          return aRmp.data.avgDifficulty - bRmp.data.avgDifficulty;
        }
        return bRmp.data.avgDifficulty - aRmp.data.avgDifficulty;
      }
    }
    return 0;
  });

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
      <TableContainer className="w-fit mb-4">
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
                  className="text-center py-3 border-x-2 border-t-2 rounded-t-lg w-min"
                  sx={{ borderBottom: 'none' }}
                  style={{
                    borderColor: mappedColors[index],
                    backgroundColor: mappedColors[index] + '10', // add transparency
                  }}
                >
                  {searchQueryLabel(result)}
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
            <GradeOrRmpRow<RMPInterface>
              name="Rating"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMPInterface) => data.avgRating}
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
            <GradeOrRmpRow<RMPInterface>
              name="Would Take Again"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMPInterface) => data.wouldTakeAgainPercent}
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
            <GradeOrRmpRow<RMPInterface>
              name="Difficulty"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMPInterface) => data.avgDifficulty}
              formatValue={(value: number) => value.toFixed(1)}
              goodValue={0}
              badValue={5}
              loadingFiller="5.0"
              cell_className="py-3 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
              defaultAscSort
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
              getRmpValue={(data: RMPInterface) => data.numRatings}
              loadingFiller="100"
              cell_className="pt-3 pb-2 border-x-2"
              colors={mappedColors}
            />
            <CheckboxRow
              name="Color"
              courses={sortedResults}
              removeFromCompare={removeFromCompare}
              cell_className="pt-0 pb-1 border-x-2 border-b-2 rounded-b-lg"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CompareTable;
