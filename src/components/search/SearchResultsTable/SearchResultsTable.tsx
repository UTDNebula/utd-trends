'use client';

import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { use, useMemo, useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import Rating from '@/components/common/Rating/Rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import { gpaToColor, useRainbowColors } from '@/modules/colors';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { displaySemesterName } from '@/modules/semesters';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
  type SearchResult,
} from '@/types/SearchQuery';
import { calculateGrades } from '@/modules/fetchGrades';
import { FiltersContext } from '@/app/dashboard/FilterContext';
import dynamic from 'next/dynamic';
const AddToPlanner = dynamic(() => import('./AddToPlanner'), {
  ssr: false,
  loading: () => <Checkbox disabled icon={<BookOutlinedIcon />} />,
});

// sets the color for the table head cells
function getCellSx() {
  return {
    backgroundColor: 'rgb(252,252,252)',
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'var(--mui-palette-background-default)',
    },
  };
}

function LoadingRow() {
  const nameCell = (
    <Typography className="w-1/2 sm:w-full leading-tight text-lg">
      <Skeleton />
    </Typography>
  );
  return (
    <>
      <TableRow className="sm:hidden">
        <TableCell
          component="th"
          scope="row"
          className="w-full border-b-0 pb-0"
          colSpan={3}
        >
          {nameCell}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="flex">
          <IconButton aria-label="expand row" size="medium" disabled>
            <KeyboardArrowIcon />
          </IconButton>
          <Checkbox disabled />
          <Checkbox disabled icon={<BookOutlinedIcon />} />
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          className="w-full hidden sm:table-cell"
        >
          {nameCell}
        </TableCell>
        <TableCell align="center">
          <Skeleton
            variant="rounded"
            className="rounded-full px-5 py-2 min-w-16 block mx-auto"
          >
            <Typography className="text-base">A+</Typography>
          </Skeleton>
        </TableCell>
        <TableCell align="center">
          <Skeleton variant="rounded" className="rounded-full mx-auto">
            <Rating sx={{ fontSize: 25 }} readOnly />
          </Skeleton>
        </TableCell>
      </TableRow>
    </>
  );
}

export function LoadingSearchResultsTable() {
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
              <TableCell className="hidden sm:table-cell" sx={getCellSx()}>
                Actions
              </TableCell>
              <TableCell sx={getCellSx()}>
                <TableSortLabel active direction="asc">
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={getCellSx()}>
                <Tooltip
                  title="Median Letter Grade Across Course Sections"
                  placement="top"
                >
                  <div>
                    <TableSortLabel direction="desc">Grades</TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={getCellSx()}>
                <Tooltip
                  title="Average Professor Rating from Rate My Professors"
                  placement="top"
                >
                  <div>
                    <TableSortLabel direction="desc">Rating</TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array(20)
              .fill(0)
              .map((_, index) => (
                <LoadingRow key={index} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

type RowProps = {
  searchResult: SearchResult;
  course: SearchQuery;
  inCompare: boolean;
  addToCompare: (arg0: SearchResult) => void;
  removeFromCompare: (arg0: SearchResult) => void;
  color?: string;
  showTutorial: boolean;
};

function Row({
  searchResult,
  course,
  inCompare,
  addToCompare,
  removeFromCompare,
  color,
  showTutorial,
}: RowProps) {
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  const [open, setOpen] = useState(false);

  const rainbowColors = useRainbowColors();
  const filteredGrades = useMemo(
    () =>
      calculateGrades(searchResult.grades, chosenSemesters, chosenSectionTypes),
    [searchResult.grades, chosenSemesters, chosenSectionTypes],
  );

  const canOpen = searchResult.type === 'course' || searchResult.RMP;
  const nameCell = (
    <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 w-fit">
      <Tooltip
        title={
          typeof course.prefix !== 'undefined' &&
          typeof course.number !== 'undefined' &&
          searchResult.type !== 'professor' &&
          searchResult.courseName
        }
        placement="top"
      >
        <span>{searchQueryLabel(convertToCourseOnly(course))}</span>
      </Tooltip>
      {searchResult.type === 'combo' && <span> </span>}
      {(searchResult.type === 'professor' || searchResult.type === 'combo') && (
        <Tooltip
          title={
            typeof course.profFirst !== 'undefined' &&
            typeof course.profLast !== 'undefined' &&
            searchResult.RMP &&
            (searchResult.RMP.teacherRatingTags.length > 0
              ? 'Tags: ' +
                searchResult.RMP.teacherRatingTags
                  .sort((a, b) => b.tagCount - a.tagCount)
                  .slice(0, 3)
                  .map((tag) => tag.tagName)
                  .join(', ')
              : 'No Tags Available')
          }
          placement="top"
        >
          <span>{searchQueryLabel(convertToProfOnly(course))}</span>
        </Tooltip>
      )}

      {((typeof course.profFirst === 'undefined' &&
        typeof course.profLast === 'undefined') ||
        (typeof course.prefix === 'undefined' &&
          typeof course.number === 'undefined')) && <span> (Overall)</span>}
    </Typography>
  );

  return (
    <>
      <TableRow
        onClick={() => {
          if (canOpen) setOpen(!open);
        }}
        className={'table-row sm:hidden' + (canOpen ? ' cursor-pointer' : '')}
      >
        <TableCell
          component="th"
          scope="row"
          className="w-full border-b-0 pb-0"
          colSpan={3}
        >
          {nameCell}
        </TableCell>
      </TableRow>
      <TableRow
        onClick={() => {
          if (canOpen) setOpen(!open);
        }} // opens/closes the card by clicking anywhere on the row
        className={canOpen ? 'cursor-pointer' : ''}
        data-tutorial-id={showTutorial && 'result'}
      >
        <TableCell
          className="border-b-0"
          data-tutorial-id={showTutorial && 'actions'}
        >
          <div className="flex items-center gap-1">
            {canOpen ? (
              <Tooltip
                title={open ? 'Minimize Result' : 'Expand Result'}
                placement="top"
              >
                <IconButton
                  aria-label="expand row"
                  size="medium"
                  onClick={(e) => {
                    e.stopPropagation(); // prevents double opening/closing
                    if (canOpen) setOpen(!open);
                  }}
                  className={
                    'transition-transform' + (open ? ' rotate-90' : '')
                  }
                >
                  <KeyboardArrowIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton aria-label="expand row" size="medium" disabled>
                <KeyboardArrowIcon fontSize="inherit" />
              </IconButton>
            )}
            <Tooltip
              title={inCompare ? 'Remove from Compare' : 'Add to Compare'}
              placement="top"
            >
              <Checkbox
                checked={inCompare}
                onClick={(e) => {
                  e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
                  if (inCompare) {
                    removeFromCompare(searchResult);
                  } else {
                    addToCompare(searchResult);
                  }
                }}
                sx={
                  color
                    ? {
                        '&.Mui-checked': {
                          color: color,
                        },
                      }
                    : undefined
                } // Apply color if defined
              />
            </Tooltip>
            <AddToPlanner searchResult={searchResult} />
          </div>
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          className="w-full border-b-0 hidden sm:table-cell"
        >
          {nameCell}
        </TableCell>
        <TableCell align="center" className="border-b-0">
          {(filteredGrades.gpa >= 0 && (
            <Tooltip
              title={
                'Median GPA: ' +
                filteredGrades.gpa.toFixed(2) +
                ' | Mean GPA: ' +
                filteredGrades.mean_gpa.toFixed(2)
              }
              placement="top"
            >
              <Typography
                className="text-base text-black text-center rounded-full px-5 py-2 w-16 block mx-auto"
                sx={{
                  backgroundColor: gpaToColor(
                    rainbowColors,
                    filteredGrades.gpa,
                  ),
                }}
              >
                {gpaToLetterGrade(filteredGrades.gpa)}
              </Typography>
            </Tooltip>
          )) ||
            null}
        </TableCell>
        <TableCell align="center" className="border-b-0">
          {(searchResult.type !== 'course' &&
            searchResult.RMP &&
            ((searchResult.RMP.numRatings == 0 && <></>) ||
              (searchResult.RMP.numRatings != 0 && (
                <Tooltip
                  title={'Professor rating: ' + searchResult.RMP.avgRating}
                  placement="top"
                >
                  <div>
                    <Rating
                      defaultValue={searchResult.RMP.avgRating}
                      precision={0.1}
                      sx={{ fontSize: 25 }}
                      readOnly
                    />
                  </div>
                </Tooltip>
              )))) ||
            null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 md:p-4 flex flex-col gap-2">
              <SingleGradesInfo
                course={course}
                grades={searchResult.grades}
                filteredGrades={filteredGrades}
              />
              {searchResult.type !== 'course' && searchResult.RMP && (
                <SingleProfInfo rmp={searchResult.RMP} />
              )}
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  numSearches: number;
  includedResults: SearchResult[];
  secondaryIncludedResults: SearchResult[];
  unIncludedResults: SearchResult[];
};

export default function SearchResultsTable({
  numSearches,
  includedResults,
  secondaryIncludedResults,
  unIncludedResults,
}: SearchResultsTableProps) {
  const {
    compare,
    addToCompare,
    removeFromCompare,
    compareColorMap,
    latestSemester,
  } = useSharedState();

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

  if (
    includedResults.length === 0 &&
    secondaryIncludedResults.length === 0 &&
    unIncludedResults.length === 0
  ) {
    return (
      <div className="p-4">
        <Typography
          variant="h3"
          gutterBottom
          className="leading-tight text-3xl font-bold"
        >
          No results
        </Typography>
        <Typography variant="body1">
          There is no overlap for the selected courses, professors, and filters.
        </Typography>
      </div>
    );
  }

  //Sort
  function sortResults(a: SearchResult, b: SearchResult) {
    const aSearchQuery = a.searchQuery;
    const bSearchQuery = b.searchQuery;
    if (orderBy === 'name') {
      //same logic as in generateCombosTable.ts
      //handle undefined variables based on searchQueryLabel
      const aFirstName = aSearchQuery.profFirst ?? '';
      const bFirstName = bSearchQuery.profFirst ?? '';
      const aLastName = aSearchQuery.profLast ?? '';
      const bLastName = bSearchQuery.profLast ?? '';
      const aPrefix = aSearchQuery.prefix ?? ''; //make sure the is no empty input for prefix and number
      const bPrefix = bSearchQuery.prefix ?? '';
      const aNumber = aSearchQuery.number ?? '';
      const bNumber = bSearchQuery.number ?? '';

      if (order === 'asc') {
        //ascending alphabetical automatically sorts Overall results correctly
        if (
          (typeof aSearchQuery.profFirst === 'undefined' &&
            typeof aSearchQuery.profLast === 'undefined') ||
          (typeof aSearchQuery.prefix === 'undefined' &&
            typeof aSearchQuery.number === 'undefined')
        )
          return -1;
        if (
          (typeof bSearchQuery.profFirst === 'undefined' &&
            typeof bSearchQuery.profLast === 'undefined') ||
          (typeof bSearchQuery.prefix === 'undefined' &&
            typeof bSearchQuery.number === 'undefined')
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
          ((typeof aSearchQuery.profFirst === 'undefined' &&
            typeof aSearchQuery.profLast === 'undefined') ||
            (typeof aSearchQuery.prefix === 'undefined' &&
              typeof aSearchQuery.number === 'undefined')) &&
          ((typeof bSearchQuery.profFirst === 'undefined' &&
            typeof bSearchQuery.profLast === 'undefined') ||
            (typeof bSearchQuery.prefix === 'undefined' &&
              typeof bSearchQuery.number === 'undefined'))
        )
          return (
            bLastName.localeCompare(aLastName) || //sort by last name then first name
            bFirstName.localeCompare(aFirstName) ||
            bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
            bNumber.localeCompare(aNumber)
          );
        if (
          (typeof aSearchQuery.profFirst === 'undefined' &&
            typeof aSearchQuery.profLast === 'undefined') ||
          (typeof aSearchQuery.prefix === 'undefined' &&
            typeof aSearchQuery.number === 'undefined')
        )
          return -1;
        if (
          (typeof bSearchQuery.profFirst === 'undefined' &&
            typeof bSearchQuery.profLast === 'undefined') ||
          (typeof bSearchQuery.prefix === 'undefined' &&
            typeof bSearchQuery.number === 'undefined')
        )
          return 1;
        return (
          bLastName.localeCompare(aLastName) || //sort by last name then first name
          bFirstName.localeCompare(aFirstName) ||
          bPrefix.localeCompare(aPrefix) || //if names are equal/don't exist, then, sort by prefix then number
          bNumber.localeCompare(aNumber)
        );
      }
    }
    if (orderBy === 'gpa') {
      const aGrades = calculateGrades(a.grades);
      const bGrades = calculateGrades(b.grades);

      if (order === 'asc') {
        return aGrades.gpa - bGrades.gpa;
      }
      return bGrades.gpa - aGrades.gpa;
    }
    if (orderBy === 'rating') {
      if (a.type === 'course' || !a.RMP) return 9999;
      if (b.type === 'course' || !b.RMP) return -9999;
      const aRmp = a.RMP;
      const bRmp = b.RMP;
      //drop loading/error rows to bottom
      if (aRmp.numRatings == 0 && bRmp.numRatings == 0) {
        // If both aRmp and bRmp are not done, treat them as equal and return 0
        return 0;
      }
      if (aRmp.numRatings == 0) {
        return 9999;
      }
      if (bRmp.numRatings == 0) {
        return -9999;
      }
      const aRating = aRmp.avgRating ?? 0; // Fallback to 0 if undefined
      const bRating = bRmp.avgRating ?? 0; // Fallback to 0 if undefined
      if (order === 'asc') {
        return aRating - bRating;
      }
      return bRating - aRating;
    }
    return 0;
  }

  const sortedResults = includedResults.sort(sortResults);
  const sortedSecondaryIncludedResults =
    secondaryIncludedResults.sort(sortResults);
  const sortedUnIncludedResults = unIncludedResults.sort(sortResults);

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
              <TableCell className="hidden sm:table-cell" sx={getCellSx()}>
                Actions
              </TableCell>
              <TableCell sx={getCellSx()}>
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
              <TableCell align="center" sx={getCellSx()}>
                <Tooltip
                  title="Average Letter Grade Across Course Sections"
                  placement="top"
                >
                  <div>
                    <TableSortLabel
                      active={orderBy === 'gpa'}
                      direction={orderBy === 'gpa' ? order : 'desc'}
                      onClick={() => {
                        handleClick('gpa');
                      }}
                    >
                      Grades
                    </TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell align="center" sx={getCellSx()}>
                <Tooltip
                  title="Average Professor Rating from Rate My Professors"
                  placement="top"
                >
                  <div>
                    <TableSortLabel
                      active={orderBy === 'rating'}
                      direction={orderBy === 'rating' ? order : 'desc'}
                      onClick={() => {
                        handleClick('rating');
                      }}
                    >
                      Rating
                    </TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Included Results */}
            {sortedResults.map((result, index) => {
              return (
                <Row
                  searchResult={result}
                  key={searchQueryLabel(result.searchQuery)}
                  course={result.searchQuery}
                  inCompare={compare.some((obj) =>
                    searchQueryEqual(obj.searchQuery, result.searchQuery),
                  )}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={compareColorMap[searchQueryLabel(result.searchQuery)]}
                  showTutorial={index === numSearches}
                />
              );
            })}

            {/* First Divider row */}
            {sortedSecondaryIncludedResults.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <div className="flex items-center py-2 my-2">
                    <Divider className="grow" />
                    <Typography className="px-4 text-base font-bold text-gray-500 dark:text-gray-300">
                      {'Teaching Next Semester, Filters Do Not Match'}
                    </Typography>
                    <Divider className="grow" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Unincluded Results (Unavailable courses) */}
            {sortedSecondaryIncludedResults.map((result) => {
              return (
                <Row
                  searchResult={result}
                  key={searchQueryLabel(result.searchQuery)}
                  course={result.searchQuery}
                  inCompare={compare.some((obj) =>
                    searchQueryEqual(obj.searchQuery, result.searchQuery),
                  )}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={compareColorMap[searchQueryLabel(result.searchQuery)]}
                  showTutorial={false}
                />
              );
            })}

            {/* Divider row */}
            {sortedUnIncludedResults.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <div className="flex items-center py-2 my-2">
                    <Divider className="grow" />
                    <Typography className="px-4 text-base font-bold text-gray-500 dark:text-gray-300">
                      {'Not teaching ' +
                        (latestSemester !== ''
                          ? 'in ' + displaySemesterName(latestSemester, false)
                          : 'Next Semester')}
                    </Typography>
                    <Divider className="grow" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Unincluded Results (Unavailable courses) */}
            {sortedUnIncludedResults.map((result) => {
              return (
                <Row
                  searchResult={result}
                  key={searchQueryLabel(result.searchQuery)}
                  course={result.searchQuery}
                  inCompare={compare.some((obj) =>
                    searchQueryEqual(obj.searchQuery, result.searchQuery),
                  )}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={compareColorMap[searchQueryLabel(result.searchQuery)]}
                  showTutorial={false}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
