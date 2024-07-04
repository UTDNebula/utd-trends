import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
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
import searchQueryEqual from '../../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';
import SingleGradesInfo from '../SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '../SingleProfInfo/singleProfInfo';

function LoadingRow() {
  return (
    <TableRow>
      <TableCell>
        <IconButton aria-label="expand row" size="small" disabled>
          <KeyboardArrowIcon />
        </IconButton>
      </TableCell>
      <TableCell>
        <Checkbox disabled />
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography className="w-[20ch] leading-tight text-lg text-gray-600 dark:text-gray-200">
          <Skeleton />
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="rounded" className="rounded-full px-5 py-2">
          <Typography className="text-base">4.00</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="rounded" className="rounded-full px-5 py-2">
          <Typography className="text-base">5.0</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="rounded" className="rounded-full px-5 py-2">
          <Typography className="text-base">5.0</Typography>
        </Skeleton>
      </TableCell>
    </TableRow>
  );
}

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
            disabled={gradesLoading === 'loading' || rmpLoading === 'loading'}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {searchQueryLabel(course)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          {gradesLoading === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">4.00</Typography>
            </Skeleton>
          )}
          {gradesLoading === 'error' && <CloseIcon />}
          {gradesLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(4, 0, grades.gpa) }}
            >
              {grades.gpa.toFixed(2)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {rmpLoading === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">5.0</Typography>
            </Skeleton>
          )}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(5, 0, rmp.averageRating) }}
            >
              {rmp.averageRating.toFixed(1)}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {rmpLoading === 'loading' && (
            <Skeleton variant="rounded" className="rounded-full px-5 py-2">
              <Typography className="text-base">5.0</Typography>
            </Skeleton>
          )}
          {(rmpLoading === 'error' || typeof rmpLoading === 'undefined') && (
            <CloseIcon />
          )}
          {rmpLoading === 'done' && (
            <Typography
              className="text-base text-black rounded-full px-5 py-2 inline"
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
            <div className="p-2 md:p-4 flex flex-col gap-2">
              <SingleGradesInfo
                course={course}
                grades={grades}
                gradesLoading={gradesLoading}
              />
              <SingleProfInfo rmp={rmp} rmpLoading={rmpLoading} />
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  resultsLoading: 'loading' | 'done';
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
  resultsLoading,
  includedResults,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
  compare,
  addToCompare,
  removeFromCompare,
}: SearchResultsTableProps) => {
  //Table sorting category
  const [orderBy, setOrderBy] = useState<
    'none' | 'gpa' | 'rating' | 'difficulty'
  >('none');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  //Cycle through sorting
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

  if (resultsLoading !== 'loading' && includedResults.length === 0) {
    return (
      <div className="p-4">
        <Typography
          variant="h3"
          gutterBottom
          className="leading-tight text-3xl font-bold"
        >
          No results found
        </Typography>
        <Typography variant="body1">
          There is no overlap between the selected courses and professors.
        </Typography>
      </div>
    );
  }

  //Sort
  let sortedResults = includedResults;
  if (orderBy !== 'none') {
    sortedResults = [...includedResults].sort((a, b) => {
      if (orderBy === 'gpa') {
        const aGrades = grades[searchQueryLabel(a)];
        const bGrades = grades[searchQueryLabel(b)];
        const aGradesLoading = gradesLoading[searchQueryLabel(a)];
        const bGradesLoading = gradesLoading[searchQueryLabel(b)];
        //drop loading/error rows to bottom
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
        //drop loading/error rows to bottom
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
      return 0;
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
            {resultsLoading === 'done'
              ? sortedResults.map((result) => (
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
                      compare.findIndex((obj) =>
                        searchQueryEqual(obj, result),
                      ) !== -1
                    }
                    addToCompare={addToCompare}
                    removeFromCompare={removeFromCompare}
                  />
                ))
              : Array(10)
                  .fill(0)
                  .map((_, index) => <LoadingRow key={index} />)}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SearchResultsTable;
