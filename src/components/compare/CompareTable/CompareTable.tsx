'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import { gpaToColor, useRainbowColors } from '@/modules/colors';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryLabel,
} from '@/types/SearchQuery';

//Find the color corresponding to a number in a range
function colorMidpoint(
  good: number,
  bad: number,
  value: number,
  startRainbowColor: string,
  endRainbowColor: string,
) {
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

  const startColor = {
    r: parseInt(startRainbowColor.slice(1, 3), 16),
    g: parseInt(startRainbowColor.slice(3, 5), 16),
    b: parseInt(startRainbowColor.slice(5, 7), 16),
  };

  const endColor = {
    r: parseInt(endRainbowColor.slice(1, 3), 16),
    g: parseInt(endRainbowColor.slice(3, 5), 16),
    b: parseInt(endRainbowColor.slice(5, 7), 16),
  };

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
  cell_className: string;
  colors: string[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleClick: (arg0: string) => void;
  defaultAscSort?: boolean;
  rainbowColors: string[];
};
// This is for grade or rmp related rows in the compare table, it displays grade or rmp data for each course
function GradeOrRmpRow<T>({
  name,
  values, // data points to show with fetch state
  getValue, // basically knows what path to take to get the specific data point from the object
  formatValue, // formatting for display
  goodValue, // for gradient
  badValue,
  cell_className, // for specifying border mostly
  colors, // border colors
  orderBy, // for controlling sorting
  order,
  handleClick,
  defaultAscSort,
  rainbowColors,
}: GradeOrRmpRowProps<T>) {
  const tooltipTitles: { [key: string]: string } = {
    GPA: 'Sort by GPA',
    Rating: 'Sort by Rating',
    'Would Take Again': 'Sort by Would Take Again %',
    Difficulty: 'Sort by Difficulty',
  };
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
          {tooltipTitles[name] ? (
            <Tooltip
              title={tooltipTitles[name]}
              placement="left"
              PopperProps={{
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 10], // Adjust these values as needed
                    },
                  },
                ],
              }}
            >
              <span>{name}</span>
            </Tooltip>
          ) : (
            name
          )}
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
          {((typeof value === 'undefined' || value.message !== 'success') && (
            <></>
          )) ||
            (value.message === 'success' && getValue(value.data) !== -1 ? (
              (name !== 'GPA' ? (value.data as RMP).numRatings > 0 : true) && ( // do not display RMP data (non-GPA data) if there are no reviews
                <Tooltip
                  title={`${name}: ${formatValue(getValue(value.data))}`}
                  placement="top"
                >
                  <Typography
                    className="text-base inline rounded-full px-5 py-2 text-black"
                    style={{
                      backgroundColor:
                        name === 'GPA'
                          ? gpaToColor(rainbowColors, getValue(value.data))
                          : colorMidpoint(
                              goodValue,
                              badValue,
                              getValue(value.data),
                              rainbowColors[12],
                              rainbowColors[0],
                            ),
                    }}
                  >
                    {/*value.data is all the data past the state of loading, done, or error.
                getValue returns the specific value from the data structure, like gpa.
                formatValue makes it look pretty like 3.7216373 displaying as 3.72.*/}
                    {formatValue(getValue(value.data))}
                  </Typography>
                </Tooltip>
              )
            ) : (
              <Typography className="text-base opacity-0">0.00</Typography>
            )) ||
            null}
        </TableCell>
      ))}
    </TableRow>
  );
}

type GradeAndRmpRowProps = {
  name: string;
  gradeValues: GenericFetchedData<Grades>[];
  rmpValues: GenericFetchedData<RMP>[];
  getGradeValue: (arg0: Grades) => number;
  getRmpValue: (arg0: RMP) => number;
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
  cell_className, // for specifying border mostly
  colors, // border colors
}: GradeAndRmpRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        <Tooltip
          title="Total # of Grades & Ratings"
          placement="left"
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8], // Adjust these values as needed
                },
              },
            ],
          }}
        >
          <span>{name}</span>
        </Tooltip>
      </TableCell>
      {gradeValues
        // Combine values
        .map((x, i) => [x, rmpValues[i]])
        // so ts can remember the type of rmp (which it can't do for rmpValues[index]) and know's that when its state is done, you can access its data value
        .map(([grade, rmp], index) => {
          const gradeValue =
            typeof grade !== 'undefined' && grade.message === 'success'
              ? getGradeValue(grade.data as Grades)
              : null;
          const rmpValue =
            typeof rmp !== 'undefined' && rmp.message === 'success'
              ? getRmpValue(rmp.data as RMP)
              : null;

          return (
            <TableCell
              align="center"
              key={index}
              className={cell_className}
              style={{
                borderColor: colors[index],
                backgroundColor: colors[index] + '10', // add transparency
              }}
            >
              <Tooltip
                title={`Grades: ${gradeValue !== null ? gradeValue : 'N/A'} / Ratings: ${rmpValue !== null ? rmpValue : 'N/A'}`}
                placement="top"
              >
                <span>
                  {((typeof grade === 'undefined' ||
                    grade.message !== 'success') && <CloseIcon />) ||
                    (grade.message === 'success' && (
                      <Typography className="text-base inline">
                        {gradeValue}
                      </Typography>
                    )) ||
                    null}
                  {' / '}
                  {((typeof rmp === 'undefined' ||
                    rmp.message !== 'success') && <CloseIcon />) ||
                    (rmp.message === 'success' && rmpValue == 0 && (
                      <CloseIcon />
                    )) ||
                    (rmp.message === 'success' && rmpValue != 0 && (
                      <Typography className="text-base inline">
                        {rmpValue}
                      </Typography>
                    )) ||
                    null}
                </span>
              </Tooltip>
            </TableCell>
          );
        })}
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
          <Tooltip title="Remove from Compare">
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
          </Tooltip>
        </TableCell>
      ))}
    </TableRow>
  );
}

type CompareTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GenericFetchedData<Grades> };
  rmp: { [key: string]: GenericFetchedData<RMP> };
  removeFromCompare: (arg0: SearchQuery) => void;
  colorMap: { [key: string]: string };
};

export default function CompareTable({
  includedResults,
  grades,
  rmp,
  removeFromCompare,
  colorMap,
}: CompareTableProps) {
  //Table sorting category
  const [orderBy, setOrderBy] = useState<string>('Color');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  //Cycle through sorting

  const rainbowColors = useRainbowColors();

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
        (!aGrades || aGrades.message !== 'success') &&
        (!bGrades || bGrades.message !== 'success')
      ) {
        return 0;
      }
      if (!aGrades || aGrades.message !== 'success') {
        return 9999;
      }
      if (!bGrades || bGrades.message !== 'success') {
        return -9999;
      }
      if (order === 'asc') {
        return aGrades.data.filtered.gpa - bGrades.data.filtered.gpa;
      }
      return bGrades.data.filtered.gpa - aGrades.data.filtered.gpa;
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
        (!aRmp || aRmp.message !== 'success') &&
        (!bRmp || bRmp.message !== 'success')
      ) {
        // If both aRmp and bRmp are not done, treat them as equal and return 0
        return 0;
      }
      if (!aRmp || aRmp.message !== 'success') {
        return 9999;
      }
      if (!bRmp || bRmp.message !== 'success') {
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

  // Update mappedColors to use the passed colorMap
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
            <GradeOrRmpRow<Grades>
              name="GPA"
              values={sortedResults.map(
                (result) => grades[searchQueryLabel(result)],
              )}
              getValue={(data: Grades) => data.filtered.gpa}
              formatValue={(value: number) => value.toFixed(2)}
              goodValue={4}
              badValue={0}
              cell_className="py-3 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
              rainbowColors={rainbowColors}
            />

            <GradeOrRmpRow<RMP>
              name="Rating"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMP) => data.avgRating}
              formatValue={(value: number) => value.toFixed(1)}
              goodValue={5}
              badValue={0}
              cell_className="py-3 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
              rainbowColors={rainbowColors}
            />
            <GradeOrRmpRow<RMP>
              name="Would Take Again"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMP) => data.wouldTakeAgainPercent}
              formatValue={(value: number) => value.toFixed(0) + '%'}
              goodValue={100}
              badValue={0}
              cell_className="py-3 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
              rainbowColors={rainbowColors}
            />
            <GradeOrRmpRow<RMP>
              name="Difficulty"
              values={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getValue={(data: RMP) => data.avgDifficulty}
              formatValue={(value: number) => value.toFixed(1)}
              goodValue={0}
              badValue={5}
              cell_className="py-3 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
              defaultAscSort
              rainbowColors={rainbowColors}
            />
            <GradeAndRmpRow
              name="# of Grades / Ratings"
              gradeValues={sortedResults.map(
                (result) => grades[searchQueryLabel(result)],
              )}
              rmpValues={sortedResults.map(
                (result) => rmp[searchQueryLabel(convertToProfOnly(result))],
              )}
              getGradeValue={(data: Grades) => data.filtered.total}
              getRmpValue={(data: RMP) => data.numRatings}
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
}
