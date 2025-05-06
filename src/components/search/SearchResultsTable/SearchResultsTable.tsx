'use client';

import BookIcon from '@mui/icons-material/Book';
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
import React, { useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import Rating from '@/components/common/Rating/Rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import { gpaToColor, useRainbowColors } from '@/modules/colors';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import useHasHydrated from '@/modules/useHasHydrated';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
  sectionCanOverlap,
} from '@/types/SearchQuery';

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
              <TableCell className="hidden sm:table-cell">Actions</TableCell>
              <TableCell>
                <TableSortLabel active direction="asc">
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <Tooltip
                  title="Median Letter Grade Across Course Sections"
                  placement="top"
                >
                  <div>
                    <TableSortLabel direction="desc">Grades</TableSortLabel>
                  </div>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
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
  section: GenericFetchedData<Sections>;
  course: SearchQuery;
  grades: GenericFetchedData<Grades>;
  rmp: GenericFetchedData<RMP>;
  inCompare: boolean;
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
  color?: string;
  inPlanner: boolean;
  addJustCourseToo: boolean;
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  showTutorial: boolean;
};

function Row({
  section,
  course,
  grades,
  rmp,
  inCompare,
  addToCompare,
  removeFromCompare,
  color,
  inPlanner,
  addJustCourseToo,
  addToPlanner,
  removeFromPlanner,
  showTutorial,
}: RowProps) {
  // Check if the course section has the latest semester data
  const hasLatestSemester = !!(
    typeof section !== 'undefined' &&
    section.message === 'success' &&
    section.data.latest.length
  );

  const [open, setOpen] = useState(false);
  const canOpen =
    !(typeof grades === 'undefined' || grades.message !== 'success') ||
    !(typeof rmp === 'undefined' || rmp.message !== 'success');

  const rainbowColors = useRainbowColors();

  const nameCell = (
    <Tooltip
      title={
        typeof course.profFirst !== 'undefined' &&
        typeof course.profLast !== 'undefined' &&
        (rmp !== undefined &&
        rmp.message === 'success' &&
        rmp.data.teacherRatingTags.length > 0
          ? 'Tags: ' +
            rmp.data.teacherRatingTags
              .sort((a, b) => b.tagCount - a.tagCount)
              .slice(0, 3)
              .map((tag) => tag.tagName)
              .join(', ')
          : 'No Tags Available')
      }
      placement="top"
    >
      <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 w-fit">
        {searchQueryLabel(course) +
          ((typeof course.profFirst === 'undefined' &&
            typeof course.profLast === 'undefined') ||
          (typeof course.prefix === 'undefined' &&
            typeof course.number === 'undefined')
            ? ' (Overall)'
            : '')}
      </Typography>
    </Tooltip>
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
                    removeFromCompare(course);
                  } else {
                    addToCompare(course);
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
            <Tooltip
              title={
                hasLatestSemester
                  ? inPlanner
                    ? 'Remove from Planner'
                    : 'Add to Planner'
                  : 'Not being taught'
              }
              placement="top"
            >
              <span>
                <Checkbox
                  checked={inPlanner}
                  onClick={(e) => {
                    e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
                    if (inPlanner) {
                      removeFromPlanner(course);
                    } else {
                      addToPlanner(course);
                      if (addJustCourseToo) {
                        addToPlanner(convertToCourseOnly(course));
                      }
                    }
                  }}
                  icon={<BookOutlinedIcon />}
                  checkedIcon={<BookIcon />}
                  disabled={!hasLatestSemester}
                />
              </span>
            </Tooltip>
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
          {((typeof grades === 'undefined' || grades.message !== 'success') && (
            <></>
          )) ||
            (grades.message === 'success' && grades.data.filtered.gpa >= 0 && (
              <Tooltip
                title={
                  'Median GPA: ' +
                  grades.data.filtered.gpa.toFixed(2) +
                  ' | Mean GPA: ' +
                  grades.data.filtered.mean_gpa.toFixed(2)
                }
                placement="top"
              >
                <Typography
                  className="text-base text-black text-center rounded-full px-5 py-2 w-16 block mx-auto"
                  sx={{
                    backgroundColor: gpaToColor(
                      rainbowColors,
                      grades.data.filtered.gpa,
                    ),
                  }}
                >
                  {gpaToLetterGrade(grades.data.filtered.gpa)}
                </Typography>
              </Tooltip>
            )) ||
            null}
        </TableCell>
        <TableCell align="center" className="border-b-0">
          {((typeof rmp === 'undefined' || rmp.message !== 'success') && (
            <></>
          )) ||
            (rmp.message === 'success' && rmp.data.numRatings == 0 && <></>) ||
            (rmp.message === 'success' && rmp.data.numRatings != 0 && (
              <Tooltip
                title={'Professor rating: ' + rmp.data.avgRating}
                placement="top"
              >
                <div>
                  <Rating
                    defaultValue={rmp.data.avgRating}
                    precision={0.1}
                    sx={{ fontSize: 25 }}
                    readOnly
                  />
                </div>
              </Tooltip>
            )) ||
            null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 md:p-4 flex flex-col gap-2">
              <SingleGradesInfo
                course={course}
                grades={grades}
                gradesToUse="filtered"
              />
              <SingleProfInfo rmp={rmp} />
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  numSearches: number;
  includedResults: SearchQuery[];
  unIncludedResults: SearchQuery[];
};

export default function SearchResultsTable({
  numSearches,
  includedResults,
  unIncludedResults,
}: SearchResultsTableProps) {
  const {
    grades,
    rmp,
    sections,
    compare,
    addToCompare,
    removeFromCompare,
    compareColorMap,
    planner,
    addToPlanner,
    removeFromPlanner,
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

  // To avoid hydration errors
  const hasHydrated = useHasHydrated();
  if (!hasHydrated) {
    return <LoadingSearchResultsTable />;
  }

  if (includedResults.length === 0 && unIncludedResults.length === 0) {
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
  function sortResults(a: SearchQuery, b: SearchQuery) {
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
    }
    if (orderBy === 'gpa') {
      const aGrades = grades[searchQueryLabel(a)];
      const bGrades = grades[searchQueryLabel(b)];
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
    if (orderBy === 'rating') {
      const aRmp = rmp[searchQueryLabel(convertToProfOnly(a))];
      const bRmp = rmp[searchQueryLabel(convertToProfOnly(b))];
      //drop loading/error rows to bottom
      if (
        (!aRmp || aRmp.message !== 'success' || aRmp.data.numRatings == 0) &&
        (!bRmp || bRmp.message !== 'success' || bRmp.data.numRatings == 0)
      ) {
        // If both aRmp and bRmp are not done, treat them as equal and return 0
        return 0;
      }
      if (!aRmp || aRmp.message !== 'success' || aRmp.data.numRatings == 0) {
        return 9999;
      }
      if (!bRmp || bRmp.message !== 'success' || bRmp.data.numRatings == 0) {
        return -9999;
      }
      const aRating = aRmp?.data?.avgRating ?? 0; // Fallback to 0 if undefined
      const bRating = bRmp?.data?.avgRating ?? 0; // Fallback to 0 if undefined
      if (order === 'asc') {
        return aRating - bRating;
      }
      return bRating - aRating;
    }
    return 0;
  }

  const sortedResults = includedResults.sort(sortResults);
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
              <TableCell className="hidden sm:table-cell">Actions</TableCell>
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
              <TableCell align="center">
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
              <TableCell align="center">
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
              const courseOnlySections =
                sections[searchQueryLabel(convertToCourseOnly(result))];
              const canAddCourseOnlyToPlanner =
                typeof courseOnlySections !== 'undefined' &&
                courseOnlySections.message === 'success' &&
                courseOnlySections.data.latest.some((section) =>
                  sectionCanOverlap(section.section_number),
                );
              return (
                <Row
                  section={sections[searchQueryLabel(result)]}
                  key={searchQueryLabel(result)}
                  course={result}
                  grades={grades[searchQueryLabel(result)]}
                  rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                  inCompare={compare.some((obj) =>
                    searchQueryEqual(obj, result),
                  )}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={compareColorMap[searchQueryLabel(result)]}
                  inPlanner={planner.some((obj) =>
                    searchQueryEqual(obj, result),
                  )}
                  addJustCourseToo={
                    !searchQueryEqual(result, convertToCourseOnly(result)) &&
                    canAddCourseOnlyToPlanner
                  }
                  addToPlanner={addToPlanner}
                  removeFromPlanner={removeFromPlanner}
                  showTutorial={index === numSearches}
                />
              );
            })}

            {/* Divider row */}
            {sortedUnIncludedResults.length > 0 && (
              <TableRow className="bg-gray-200 dark:bg-gray-700">
                <TableCell colSpan={5} className="p-0">
                  <div className="flex items-center py-2 my-2">
                    <Divider className="grow" />
                    <Typography className="px-4 text-base font-bold text-gray-500 dark:text-gray-300">
                      Not teaching next semester
                    </Typography>
                    <Divider className="grow" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Unincluded Results (Unavailable courses) */}
            {sortedUnIncludedResults.map((result) => {
              const courseOnlySections =
                sections[searchQueryLabel(convertToCourseOnly(result))];
              const canAddCourseOnlyToPlanner =
                typeof courseOnlySections !== 'undefined' &&
                courseOnlySections.message === 'success' &&
                courseOnlySections.data.latest.some((section) =>
                  sectionCanOverlap(section.section_number),
                );
              return (
                <Row
                  section={sections[searchQueryLabel(result)]}
                  key={searchQueryLabel(result)}
                  course={result}
                  grades={grades[searchQueryLabel(result)]}
                  rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                  inCompare={compare.some((obj) =>
                    searchQueryEqual(obj, result),
                  )}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={compareColorMap[searchQueryLabel(result)]}
                  inPlanner={planner.some((obj) =>
                    searchQueryEqual(obj, result),
                  )}
                  addJustCourseToo={
                    !searchQueryEqual(result, convertToCourseOnly(result)) &&
                    canAddCourseOnlyToPlanner
                  }
                  addToPlanner={addToPlanner}
                  removeFromPlanner={removeFromPlanner}
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
