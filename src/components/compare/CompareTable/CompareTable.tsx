'use client';

import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import AddToPlanner from '@/components/search/SearchResultsTable/AddToPlanner';
import { gpaToColor, useRainbowColors } from '@/modules/colors';
import { calculateGrades, type GradesData } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import { searchQueryLabel, type SearchResult } from '@/types/SearchQuery';
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

type ValueTagProps = {
  /** Display value; -1 = loading placeholder, undefined = show nothing, number = show tag */
  value: number | -1 | undefined;
  formatValue: (n: number) => string;
  tooltipTitle: string;
  backgroundColor: string;
};

/** Shared tag-style value display for desktop and mobile compare table cells */
function ValueTag({
  value,
  formatValue,
  tooltipTitle,
  backgroundColor,
}: ValueTagProps) {
  if (value === undefined) return null;
  if (value === -1) {
    return (
      <Typography className="text-xs sm:text-base opacity-0">0.00</Typography>
    );
  }
  return (
    <Tooltip title={tooltipTitle} placement="top">
      <Typography
        className="text-xs sm:text-base inline-block sm:inline min-w-[8vw] sm:min-w-0 rounded-full px-1 py-1 sm:px-5 sm:py-2 text-black"
        style={{ backgroundColor }}
      >
        {formatValue(value)}
      </Typography>
    </Tooltip>
  );
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
      <TableCell align="right">
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
      {values.map((value, index) => {
        const rawVal = value === undefined ? undefined : getValue(value);
        const displayVal: number | -1 | undefined =
          value === undefined
            ? undefined
            : rawVal === -1
              ? -1
              : (name !== 'GPA' ? (value as RMP).numRatings > 0 : true)
                ? rawVal!
                : undefined;
        const showTag = displayVal !== undefined && displayVal !== -1;
        const tooltipTitle = showTag
          ? `${name}: ${formatValue(displayVal as number)}`
          : '';
        const backgroundColor = showTag
          ? name === 'GPA'
            ? gpaToColor(rainbowColors, displayVal as number)
            : colorMidpoint(
                goodValue,
                badValue,
                displayVal as number,
                rainbowColors[12],
                rainbowColors[0],
              )
          : '';
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
            <ValueTag
              value={displayVal}
              formatValue={formatValue}
              tooltipTitle={tooltipTitle}
              backgroundColor={backgroundColor}
            />
          </TableCell>
        );
      })}
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
      <TableCell align="right">
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
      <TableCell align="right">
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
      <TableCell align="right">{name}</TableCell>
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
  const [orderBy, setOrderBy] = useState<string>('GPA');
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
      {/* Desktop version */}
      <TableContainer className="hidden sm:table w-fit mb-4">
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
      {/* Mobile version (rotated) */}
      <div className="w-full min-w-0 overflow-x-auto sm:hidden">
        <TableContainer className="w-full mb-4" sx={{ overflow: 'visible' }}>
          <Table
            size="small"
            className="border-separate border-spacing-x-0 border-spacing-y-2 w-full"
            sx={{ tableLayout: 'fixed' }}
          >
            <TableHead>
              <TableRow>
                {(() => {
                  const mobileHeaderBase =
                    'text-center py-2 border-t-2 border-b-2 px-0 text-[8px] leading-tight';
                  const gradesRatingsLabel = (
                    <span className="inline-flex flex-col items-center">
                      <span># of Grades</span>
                      <span className="my-0.5 w-full border-t border-current opacity-70" />
                      <span>Ratings</span>
                    </span>
                  );
                  const sortableColumns: { [key: string]: boolean } = {
                    GPA: false,
                    Rating: false,
                    'Would Take Again': false,
                    Difficulty: true, // defaultAscSort
                  };
                  const labels: (string | React.ReactNode)[] = [
                    '',
                    'Compare',
                    'GPA',
                    'Rating',
                    'Would Take Again',
                    'Difficulty',
                    gradesRatingsLabel,
                    'Add to Planner',
                  ];
                  const sortKeys = [
                    null,
                    null,
                    'GPA',
                    'Rating',
                    'Would Take Again',
                    'Difficulty',
                    null,
                    null,
                  ] as (string | null)[];
                  const sortTooltips: { [key: string]: string } = {
                    GPA: 'Sort by GPA',
                    Rating: 'Sort by Rating',
                    'Would Take Again': 'Sort by Would Take Again %',
                    Difficulty: 'Sort by Difficulty',
                  };
                  return labels.map((label, i) => {
                    const className =
                      i === 0
                        ? `font-bold border-l-2 rounded-l-lg ${mobileHeaderBase}`
                        : i === labels.length - 1
                          ? `border-r-2 rounded-r-lg ${mobileHeaderBase}`
                          : mobileHeaderBase;
                    const sortKey = sortKeys[i];
                    const content =
                      sortKey != null ? (
                        <Tooltip
                          title={sortTooltips[sortKey] ?? ''}
                          placement="top"
                        >
                          <TableSortLabel
                            active={orderBy === sortKey}
                            direction={
                              orderBy === sortKey
                                ? order
                                : sortableColumns[sortKey]
                                  ? 'asc'
                                  : 'desc'
                            }
                            onClick={() => handleClick(sortKey)}
                            sx={{
                              '& .MuiTableSortLabel-icon': {
                                marginLeft: '0',
                                marginRight: '0',
                                fontSize: '0.5rem',
                              },
                            }}
                          >
                            {label}
                          </TableSortLabel>
                        </Tooltip>
                      ) : (
                        label
                      );
                    return (
                      <TableCell
                        key={
                          typeof label === 'string' ? label : 'grades-ratings'
                        }
                        className={className}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  });
                })()}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedResults.map((result, rowIndex) => {
                const grades = result.grades;
                const rmp = result.type !== 'course' ? result.RMP : undefined;
                const gradeSummary = calculateGrades(grades, chosenSemesters);
                const cellStyle = {
                  borderColor: mappedColors[rowIndex],
                  backgroundColor: mappedColors[rowIndex] + '10',
                };
                const firstCellClassName =
                  'py-2 border-t-2 border-b-2 border-l-2 px-0';
                const middleCellClassName = 'py-2 border-t-2 border-b-2 px-0';
                const lastCellClassName =
                  'py-2 border-t-2 border-b-2 border-r-2 px-0';

                const ratingVal =
                  rmp && rmp.numRatings > 0 ? rmp.avgRating : undefined;
                const wouldTakeVal =
                  rmp && rmp.numRatings > 0
                    ? rmp.wouldTakeAgainPercent
                    : undefined;
                const difficultyVal =
                  rmp && rmp.numRatings > 0 ? rmp.avgDifficulty : undefined;
                const gradeTotal = gradeSummary.total;
                const rmpTotal = rmp ? rmp.numRatings : undefined;

                return (
                  <TableRow
                    key={searchQueryLabel(result.searchQuery)}
                    sx={{ '& td': { border: 0 } }}
                  >
                    <TableCell
                      align="center"
                      className={`${firstCellClassName} rounded-l-lg`}
                      style={cellStyle}
                      sx={{ maxWidth: '1.5rem' }}
                    >
                      <Tooltip title="Remove from Compare">
                        <Checkbox
                          size="small"
                          checked={true}
                          onClick={() => removeFromCompare(result)}
                          sx={{
                            '&.Mui-checked': {
                              color: mappedColors[rowIndex],
                            },
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      component="th"
                      scope="row"
                      className={`text-center font-medium text-[10px] break-words whitespace-normal ${middleCellClassName}`}
                      sx={{
                        borderBottom: 'none',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                      style={cellStyle}
                    >
                      {searchQueryLabel(result.searchQuery)}
                    </TableCell>
                    <TableCell
                      align="center"
                      className={middleCellClassName}
                      style={cellStyle}
                    >
                      <ValueTag
                        value={gradeSummary.gpa}
                        formatValue={(x) => x.toFixed(2)}
                        tooltipTitle={
                          gradeSummary.gpa !== -1
                            ? `GPA: ${gradeSummary.gpa.toFixed(2)}`
                            : ''
                        }
                        backgroundColor={
                          gradeSummary.gpa !== -1
                            ? gpaToColor(rainbowColors, gradeSummary.gpa)
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      className={middleCellClassName}
                      style={cellStyle}
                    >
                      <ValueTag
                        value={ratingVal}
                        formatValue={(x) => x.toFixed(1)}
                        tooltipTitle={
                          ratingVal != null
                            ? `Rating: ${ratingVal.toFixed(1)}`
                            : ''
                        }
                        backgroundColor={
                          ratingVal != null
                            ? colorMidpoint(
                                5,
                                0,
                                ratingVal,
                                rainbowColors[12],
                                rainbowColors[0],
                              )
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      className={middleCellClassName}
                      style={cellStyle}
                    >
                      <ValueTag
                        value={wouldTakeVal}
                        formatValue={(x) => x.toFixed(0) + '%'}
                        tooltipTitle={
                          wouldTakeVal != null
                            ? `Would Take Again: ${wouldTakeVal.toFixed(0)}%`
                            : ''
                        }
                        backgroundColor={
                          wouldTakeVal != null
                            ? colorMidpoint(
                                100,
                                0,
                                wouldTakeVal,
                                rainbowColors[12],
                                rainbowColors[0],
                              )
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      className={middleCellClassName}
                      style={cellStyle}
                    >
                      <ValueTag
                        value={difficultyVal}
                        formatValue={(x) => x.toFixed(1)}
                        tooltipTitle={
                          difficultyVal != null
                            ? `Difficulty: ${difficultyVal.toFixed(1)}`
                            : ''
                        }
                        backgroundColor={
                          difficultyVal != null
                            ? colorMidpoint(
                                0,
                                5,
                                difficultyVal,
                                rainbowColors[12],
                                rainbowColors[0],
                              )
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      className={middleCellClassName}
                      style={cellStyle}
                    >
                      <Tooltip
                        title={`Grades: ${gradeTotal ?? 'N/A'} / Ratings: ${rmpTotal ?? 'N/A'}`}
                        placement="top"
                      >
                        <span className="inline-flex flex-col items-center">
                          {grades === undefined ? (
                            <CloseIcon />
                          ) : (
                            <Typography className="text-base">
                              {gradeTotal}
                            </Typography>
                          )}
                          <span className="my-0.5 w-full min-w-[1.5rem] border-t border-current opacity-70" />
                          {rmp === undefined || rmpTotal === 0 ? (
                            <CloseIcon />
                          ) : (
                            <Typography className="text-base">
                              {rmpTotal}
                            </Typography>
                          )}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      align="center"
                      className={`${lastCellClassName} rounded-r-lg`}
                      style={cellStyle}
                    >
                      <AddToPlanner searchResult={result} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
