import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  Rating,
  Skeleton,
  Stack,
  styled,
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
import type {
  GenericFetchedData,
  GradesType,
} from '../../../pages/dashboard/index';
import SingleGradesInfo from '../SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '../SingleProfInfo/singleProfInfo';

// for star color for rating
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#5D3FD3',
    stroke: '#5D3FD3', // Border color around the filled stars
    strokeWidth: 0.3,
  },
  '& .MuiRating-iconEmpty': {
    stroke: '#5D3FD3', // Border color around the empty stars
    strokeWidth: 0.1, // Thickness of the border
  },
});

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
        <Skeleton variant="rounded" className="rounded-full px-5 py-2 ml-auto">
          <Typography className="text-base">4.00</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="rounded" className="rounded-full px-5 py-2 ml-auto">
          <Typography className="text-base">5.0</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="right">
        <Skeleton variant="rounded" className="rounded-full px-5 py-2 ml-auto">
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
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RateMyProfessorData>;
  inCompare: boolean;
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
};

function Row({
  course,
  grades,
  rmp,
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
            disabled={
              (typeof grades !== 'undefined' && grades.state === 'loading') ||
              (typeof rmp !== 'undefined' && rmp.state === 'loading')
            }
          />
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {searchQueryLabel(course) +
              ((typeof course.profFirst === 'undefined' &&
                typeof course.profLast === 'undefined') ||
              (typeof course.prefix === 'undefined' &&
                typeof course.number === 'undefined')
                ? ' (Overall)'
                : '')}
          </Typography>
        </TableCell>
        <TableCell align="right">
          {((typeof grades === 'undefined' || grades.state === 'error') && (
            <CloseIcon />
          )) ||
            (grades.state === 'loading' && (
              <Skeleton
                variant="rounded"
                className="rounded-full px-5 py-2 ml-auto"
              >
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
              <Skeleton
                variant="rounded"
                className="rounded-full px-5 py-2 ml-auto"
              >
                <Typography className="text-base">5.0</Typography>
              </Skeleton>
            )) ||
            (rmp.state === 'done' && (
              <Stack spacing={1}>
                <StyledRating
                  name="customized-color"
                  defaultValue={rmp.data.averageRating}
                  getLabelText={(value: number) =>
                    `${value} Heart${value !== 1 ? 's' : ''}`
                  }
                  precision={0.1}
                  sx={{ fontSize: 25 }}
                  readOnly
                />
                <Typography>{rmp.data.averageRating}</Typography>
              </Stack>
            )) ||
            null}
        </TableCell>
        <TableCell align="right">
          {((typeof rmp === 'undefined' || rmp.state === 'error') && (
            <CloseIcon />
          )) ||
            (rmp.state === 'loading' && (
              <Skeleton
                variant="rounded"
                className="rounded-full px-5 py-2 ml-auto"
              >
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
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 md:p-4 flex flex-col gap-2">
              <SingleGradesInfo course={course} grades={grades} />
              <SingleProfInfo rmp={rmp} />
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
  grades: { [key: string]: GenericFetchedData<GradesType> };
  rmp: { [key: string]: GenericFetchedData<RateMyProfessorData> };
  compare: SearchQuery[];
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
};

const SearchResultsTable = ({
  resultsLoading,
  includedResults,
  grades,
  rmp,
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
      if (orderBy === 'rating' || orderBy === 'difficulty') {
        const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
        const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
        //drop loading/error rows to bottom
        if ((!aRmp || aRmp.state !== 'done') && (!bRmp || bRmp.state !== 'done')) {
          // If both aRmp and bRmp are not done, treat them as equal and return 0
          return 0;
        }
        if (!aRmp || aRmp.state !== 'done') {
          return -9999;
        }
        if (!bRmp || bRmp.state !== 'done') {
          return -9999;
        }
        const aRating = aRmp?.data?.averageRating ?? 0; // Fallback to 0 if undefined
        const bRating = bRmp?.data?.averageRating ?? 0; // Fallback to 0 if undefined

        const aDifficulty = aRmp?.data?.averageDifficulty ?? 0; // Fallback to 0 if undefined
        const bDifficulty = bRmp?.data?.averageDifficulty ?? 0; // Fallback to 0 if undefined


        if (orderBy === 'rating') {
          if (order === 'asc') {
            return aRating - bRating;
          }
          return bRating - aRating;
        }
        if (order === 'asc') {
          return aDifficulty - bDifficulty;
        }
        return bDifficulty - aDifficulty;
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
