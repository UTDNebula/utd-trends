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
import type { RMP } from '@/modules/fetchRmp';
import { calculateGrades, type GradesData } from '@/modules/fetchGrades';
import { searchQueryLabel, type SearchResult } from '@/types/SearchQuery';
import AddToPlanner from '@/components/search/SearchResultsTable/AddToPlanner';

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
  values: (T | undefined)[];
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
          {value === undefined ||
            (getValue(value) !== -1 ? (
              (name !== 'GPA' ? (value as RMP).numRatings > 0 : true) && ( // do not display RMP data (non-GPA data) if there are no reviews
                <Tooltip
                  title={`${name}: ${formatValue(getValue(value))}`}
                  placement="top"
                >
                  <Typography
                    className="text-base inline rounded-full px-5 py-2 text-black"
                    style={{
                      backgroundColor:
                        name === 'GPA'
                          ? gpaToColor(rainbowColors, getValue(value))
                          : colorMidpoint(
                              goodValue,
                              badValue,
                              getValue(value),
                              rainbowColors[12],
                              rainbowColors[0],
                            ),
                    }}
                  >
                    {/*value.data is all the data past the state of loading, done, or error.
                getValue returns the specific value from the data structure, like gpa.
                formatValue makes it look pretty like 3.7216373 displaying as 3.72.*/}
                    {formatValue(getValue(value))}
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
  gradeValues: GradesData[];
  rmpValues: (RMP | undefined)[];
  getGradeValue: (arg0: GradesData) => number;
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
        .map((x, i) => [x, rmpValues[i]] as const)
        // so ts can remember the type of rmp (which it can't do for rmpValues[index]) and know's that when its state is done, you can access its data value
        .map(([grade, rmp], index) => {
          const gradeValue = getGradeValue(grade);
          const rmpValue =
            typeof rmp !== 'undefined' ? getRmpValue(rmp) : undefined;

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
                  {(typeof grade === 'undefined' && <CloseIcon />) || (
                      <Typography className="text-base inline">
                        {gradeValue}
                      </Typography>
                    ) ||
                    null}
                  {' / '}
                  {((rmp === undefined || !rmp) && <CloseIcon />) ||
                    (rmpValue == 0 && <CloseIcon />) ||
                    (rmpValue != 0 && (
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

type PlannerRowProps = {
  name: string;
  courses: SearchResult[];
  cell_className: string;
  colors: string[];
  orderBy: string;
  order: 'asc' | 'desc';
};
type CheckboxRowProps = PlannerRowProps & {
  removeFromCompare: (arg0: SearchResult) => void;
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

function PlannerRow({
  name,
  courses,
  cell_className, // for specifying border mostly
  colors, // border colors
}: PlannerRowProps) {
  return (
    <TableRow sx={{ '& td': { border: 0 } }}>
      <TableCell align="right" className="pl-0">
        {name}
      </TableCell>
      {courses.map((course, index) => {
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
            <AddToPlanner searchResult={course} />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

type CompareTableProps = {
  includedResults: SearchResult[];
  removeFromCompare: (arg0: SearchResult) => void;
  colorMap: { [key: string]: string };
  chosenSemesters: string[];
  chosenSectionTypes: string[];
};

export default function CompareTable({
  includedResults,
  removeFromCompare,
  chosenSemesters,
  chosenSectionTypes,
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
      const aGrades = calculateGrades(
        a.grades,
        chosenSemesters,
        chosenSectionTypes,
      );
      const bGrades = calculateGrades(
        b.grades,
        chosenSemesters,
        chosenSectionTypes,
      );
      if (order === 'asc') {
        return aGrades.gpa - bGrades.gpa;
      }
      return bGrades.gpa - aGrades.gpa;
    }
    if (
      orderBy === 'Rating' ||
      orderBy === 'Would Take Again' ||
      orderBy === 'Difficulty'
    ) {
      if (a.type === 'course' || !a.RMP) return 9999;
      if (b.type === 'course' || !b.RMP) return -9999;
      const aRmp = a.RMP;
      const bRmp = b.RMP;

      if (orderBy === 'Rating') {
        if (order === 'asc') {
          return aRmp.avgRating - bRmp.avgRating;
        }
        return bRmp.avgRating - aRmp.avgRating;
      }
      if (orderBy === 'Would Take Again') {
        if (order === 'asc') {
          return aRmp.wouldTakeAgainPercent - bRmp.wouldTakeAgainPercent;
        }
        return bRmp.wouldTakeAgainPercent - aRmp.wouldTakeAgainPercent;
      }
      if (orderBy === 'Difficulty') {
        if (order === 'asc') {
          return aRmp.avgDifficulty - bRmp.avgDifficulty;
        }
        return bRmp.avgDifficulty - aRmp.avgDifficulty;
      }
    }
    return 0;
  });

  // Update mappedColors to use the passed colorMap
  const mappedColors = sortedResults.map(
    (result) => colorMap[searchQueryLabel(result.searchQuery)],
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
                  key={searchQueryLabel(result.searchQuery)}
                  className="text-center py-3 border-x-2 border-t-2 rounded-t-lg w-min"
                  sx={{ borderBottom: 'none' }}
                  style={{
                    borderColor: mappedColors[index],
                    backgroundColor: mappedColors[index] + '10', // add transparency
                  }}
                >
                  {searchQueryLabel(result.searchQuery)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <GradeOrRmpRow<GradesData>
              name="GPA"
              values={sortedResults.map((result) => result.grades)}
              getValue={(data) => {
                return calculateGrades(data, chosenSemesters).gpa;
              }}
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
              values={sortedResults.map((result) =>
                result.type !== 'course' ? result.RMP : undefined,
              )}
              getValue={(data) => data.avgRating}
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
              values={sortedResults.map((result) =>
                result.type !== 'course' ? result.RMP : undefined,
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
              values={sortedResults.map((result) =>
                result.type !== 'course' ? result.RMP : undefined,
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
              gradeValues={sortedResults.map((result) => result.grades)}
              rmpValues={sortedResults.map((result) =>
                result.type !== 'course' ? result.RMP : undefined,
              )}
              getGradeValue={(data) =>
                calculateGrades(data, chosenSemesters).total
              }
              getRmpValue={(data: RMP) => data.numRatings}
              cell_className="pt-3 pb-2 border-x-2"
              colors={mappedColors}
            />
            <CheckboxRow
              name="Color"
              courses={sortedResults}
              removeFromCompare={removeFromCompare}
              cell_className="pt-0 pb-1 border-x-2"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
              handleClick={handleClick}
            />
            <PlannerRow
              name="Add to Planner"
              courses={sortedResults}
              cell_className="pt-0 pb-1 border-x-2 border-b-2 rounded-b-lg"
              colors={mappedColors}
              orderBy={orderBy}
              order={order}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
