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
import Rating from '../Rating/rating';
import SingleGradesInfo from '../SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '../SingleProfInfo/singleProfInfo';
import TableSortLabel from '../TableSortLabel/tableSortLabel';

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
        <Skeleton variant="rounded" className="rounded-full ml-auto">
          <Rating sx={{ fontSize: 25 }} readOnly />
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
              <Skeleton variant="rounded" className="rounded-full ml-auto">
                <Rating sx={{ fontSize: 25 }} readOnly />
              </Skeleton>
            )) ||
            (rmp.state === 'done' && (
              <Rating
                defaultValue={rmp.data.averageRating}
                precision={0.1}
                sx={{ fontSize: 25 }}
                readOnly
              />
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
  const [orderBy, setOrderBy] = useState<'name' | 'gpa' | 'rating'>('name');
  //Table sorting direction
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  //Cycle through sorting
  function handleClick(col: 'name' | 'gpa' | 'rating') {
    if (orderBy !== col) {
      setOrderBy(col);
      if (col === 'name')
        setOrder('asc'); //default alphabetical behavior goes from a to z
      else setOrder('desc'); //default number behavior goes from high to low for our metrics
    } else {
      if (order === 'asc') {
        setOrder('desc');
      } else {
        setOrder('asc');
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
  sortedResults = [...includedResults].sort((a, b) => {
    if (orderBy === 'name') {
      //same logic as in generateCombosTable.ts
      //handle undefined variables based on searchQueryLabel
      const aFirstName = a.profFirst ?? '';
      const bFirstName = b.profFirst ?? '';
      const aLastName = a.profLast ?? '';
      const bLastName = b.profLast ?? '';
      const aPrefix = a.prefix ?? ''; //make sure the is no empty input for prefix and number
      const bPrefix = b.prefix ?? '';
      const aNumber = a.number ?? '';
      const bNumber = b.number ?? '';

      if (order === 'asc') {
        //ascending alphabetical automatically sorts Overall results correctly
        if (
          (typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
          (typeof a.prefix === 'undefined' && typeof a.number === 'undefined')
        )
          return -1;
        if (
          (typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
          (typeof b.prefix === 'undefined' && typeof b.number === 'undefined')
        )
          return 1;
        return (
          aLastName.localeCompare(bLastName) || //sort by last name then first name
          aFirstName.localeCompare(bFirstName) ||
          aPrefix.localeCompare(bPrefix) || //if names are equal/don't exist, then sort by prefix then number
          aNumber.localeCompare(bNumber)
        );
      }
      //keep the "(Overall)" result on top for descending sort too
      else {
        // catches the case where a is an Overall result AND b is an Overall result
        if (
          ((typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
            (typeof a.prefix === 'undefined' &&
              typeof a.number === 'undefined')) &&
          ((typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
            (typeof b.prefix === 'undefined' &&
              typeof b.number === 'undefined'))
        )
          return (
            bLastName.localeCompare(aLastName) || //sort by last name then first name
            bFirstName.localeCompare(aFirstName) ||
            bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
            bNumber.localeCompare(aNumber)
          );
        if (
          (typeof a.profFirst === 'undefined' &&
            typeof a.profLast === 'undefined') ||
          (typeof a.prefix === 'undefined' && typeof a.number === 'undefined')
        )
          return -1;
        if (
          (typeof b.profFirst === 'undefined' &&
            typeof b.profLast === 'undefined') ||
          (typeof b.prefix === 'undefined' && typeof b.number === 'undefined')
        )
          return 1;
        return (
          bLastName.localeCompare(aLastName) || //sort by last name then first name
          bFirstName.localeCompare(aFirstName) ||
          bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
          bNumber.localeCompare(aNumber)
        );
      }
      return 0;
    }
    if (orderBy === 'gpa') {
      const aGrades = grades[searchQueryLabel(a)];
      const bGrades = grades[searchQueryLabel(b)];
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
    if (orderBy === 'rating') {
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
      const aRating = aRmp?.data?.averageRating ?? 0; // Fallback to 0 if undefined
      const bRating = bRmp?.data?.averageRating ?? 0; // Fallback to 0 if undefined
      if (order === 'asc') {
        return aRating - bRating;
      }
      return bRating - aRating;
    }
    return 0;
  });

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
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => {
                    handleClick('name');
                  }}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'gpa'}
                  direction={orderBy === 'gpa' ? order : 'desc'}
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
                  direction={orderBy === 'rating' ? order : 'desc'}
                  onClick={() => {
                    handleClick('rating');
                  }}
                >
                  Rating
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
