import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
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
import searchQueryEqual from '../../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

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
  grades: GradesType;
  rmp: RateMyProfessorData;
  gradesLoading: 'loading' | 'done' | 'error';
  rmpLoading: 'loading' | 'done' | 'error';
  inCompare: boolean;
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
};

function Row({
  course,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
  inCompare,
  addToCompare,
  removeFromCompare,
}: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            className={'transition-transform' + (open ? ' rotate-90' : '')}
          >
            <KeyboardArrowIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={inCompare}
            onClick={() => {
              if (inCompare) {
                removeFromCompare(course);
              } else {
                addToCompare(course);
              }
            }}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {searchQueryLabel(course)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          {gradesLoading === 'loading' && <CircularProgress />}
          {gradesLoading === 'error' && <CloseIcon />}
          {gradesLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(4, 0, grades.gpa) }}
            >
              {grades.gpa.toFixed(2)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {rmpLoading === 'loading' && <CircularProgress />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(5, 0, rmp.averageRating) }}
            >
              {rmp.averageRating.toFixed(1)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {rmpLoading === 'loading' && <CircularProgress />}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{
                backgroundColor: colorMidpoint(0, 5, rmp.averageDifficulty),
              }}
            >
              {rmp.averageDifficulty.toFixed(1)}
            </Typography>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-4">
              {gradesLoading === 'loading' && <LinearProgress />}
              {gradesLoading === 'done' && (
                <>
                  <div className="h-64">
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
                      yaxisFormatter={(value) => Number(value).toLocaleString()}
                      series={[
                        {
                          name: searchQueryLabel(course),
                          data: grades.grade_distribution,
                        },
                      ]}
                    />
                  </div>
                  <div className="flex flex-wrap justify-around">
                    <p>
                      Grades: <b>{grades.total}</b>
                    </p>
                    <p>
                      GPA:{' '}
                      <b>{grades.gpa === -1 ? 'X' : grades.gpa.toFixed(3)}</b>
                    </p>
                  </div>
                </>
              )}
              {rmpLoading === 'loading' && <LinearProgress />}
              {rmpLoading === 'done' && (
                <>
                  <div className="inline-flex">
                    <Box className="bg-gray-200 dark:bg-gray-800 rounded px-2">
                      <p># of RMP ratings </p>
                      <p className="flex justify-center">
                        {rmp.numRatings === -1 ? 'X' : rmp.numRatings}
                      </p>
                    </Box>
                    <Box className="mx-3 bg-gray-200 dark:bg-gray-800 rounded px-2">
                      <p>would take again</p>
                      <p className="flex justify-center">
                        {rmp.wouldTakeAgainPercentage === -1
                          ? 'X'
                          : rmp.wouldTakeAgainPercentage.toFixed(0) + '%'}
                      </p>
                    </Box>
                  </div>
                </>
              )}
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
  gradesLoading: { [key: string]: 'loading' | 'done' | 'error' };
  rmpLoading: { [key: string]: 'loading' | 'done' | 'error' };
  compare: SearchQuery[];
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
};

const SearchResultsTable = ({
  includedResults,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
  compare,
  addToCompare,
  removeFromCompare,
}: SearchResultsTableProps) => {
  const [orderBy, setOrderBy] = useState<
    'none' | 'gpa' | 'rating' | 'difficulty'
  >('none');
  const [order, setOrder] = useState<'none' | 'asc' | 'desc'>('asc');
  function handleClick(col: 'gpa' | 'rating' | 'difficulty') {
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

  console.log(orderBy, order);
  let sortedResults = includedResults;
  if (orderBy !== 'none') {
    sortedResults = includedResults.toSorted((a, b) => {
      if (orderBy === 'gpa') {
        const aGrades = grades[searchQueryLabel(a)];
        const bGrades = grades[searchQueryLabel(b)];
        const aGradesLoading = gradesLoading[searchQueryLabel(a)];
        const bGradesLoading = gradesLoading[searchQueryLabel(b)];
        if (aGradesLoading !== 'done' && bGradesLoading !== 'done') {
          return 0;
        }
        if (aGradesLoading !== 'done') {
          return 9999;
        }
        if (bGradesLoading !== 'done') {
          return -9999;
        }
        if (order === 'asc') {
          return aGrades.gpa - bGrades.gpa;
        }
        return bGrades.gpa - aGrades.gpa;
      }
      if (orderBy === 'rating' || orderBy === 'difficulty') {
        const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
        const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
        const aRmpLoading = rmpLoading[searchQueryLabel(convertToProfOnly(a))];
        const bRmpLoading = rmpLoading[searchQueryLabel(convertToProfOnly(b))];
        if (aRmpLoading !== 'done' && bRmpLoading !== 'done') {
          return 0;
        }
        if (aRmpLoading !== 'done') {
          return 9999;
        }
        if (bRmpLoading !== 'done') {
          return -9999;
        }
        if (orderBy === 'rating') {
          if (order === 'asc') {
            return aRmp.averageRating - bRmp.averageRating;
          }
          return bRmp.averageRating - aRmp.averageRating;
        }
        if (order === 'asc') {
          return aRmp.averageDifficulty - bRmp.averageDifficulty;
        }
        return bRmp.averageDifficulty - aRmp.averageDifficulty;
      }
    });
  }

  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        Search Results
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Compare</TableCell>
              <TableCell>Name</TableCell>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedResults.map((result) => (
              <Row
                key={searchQueryLabel(result)}
                course={result}
                grades={grades[searchQueryLabel(result)]}
                rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                gradesLoading={gradesLoading[searchQueryLabel(result)]}
                rmpLoading={
                  rmpLoading[searchQueryLabel(convertToProfOnly(result))]
                }
                inCompare={
                  compare.findIndex((obj) => searchQueryEqual(obj, result)) !==
                  -1
                }
                addToCompare={addToCompare}
                removeFromCompare={removeFromCompare}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SearchResultsTable;
