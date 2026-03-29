'use client';

import { FiltersContext } from '@/app/dashboard/FilterContext';
import { useSharedState } from '@/app/SharedStateProvider';
import Rating from '@/components/common/Rating/Rating';
import { calculateGrades } from '@/modules/fetchGrades';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { compareSemesters, displaySemesterName } from '@/modules/semesters';
import type { SearchResult } from '@/types/SearchQuery';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { use } from 'react';

const minGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

export function LoadingFilters() {
  return (
    <Grid container spacing={2} className="mb-4 sm:m-0">
      {/* min letter grade dropdown*/}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="minGPA">Min Letter Grade</InputLabel>
          <Select label="Min Letter Grade" labelId="minGPA" value=""></Select>
        </FormControl>
      </Grid>

      {/* min rating dropdown*/}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="minRating">Min Rating</InputLabel>
          <Select label="Min Rating" labelId="minRating" value=""></Select>
        </FormControl>
      </Grid>

      {/* semester dropdown */}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="Semesters">Semesters</InputLabel>
          <Select label="Semesters" labelId="Semesters" value=""></Select>
        </FormControl>
      </Grid>

      {/* section type dropdown */}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="SectionTypes">Section Types</InputLabel>
          <Select label="SectionTypes" labelId="SectionTypes" value=""></Select>
        </FormControl>
      </Grid>

      {/* Teaching Next Semester switch*/}
      <Grid size={{ xs: 12, sm: 12 / 5 }} className="px-2">
        <FormControl size="small">
          <FormControlLabel
            control={<Switch checked={true} />}
            label="Teaching Next Semester"
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

/**
 * This component returns a set of filters with which to sort results.
 */
export default function Filters({
  searchResultsPromise,
}: {
  searchResultsPromise: Promise<SearchResult[]>;
}) {
  const { latestSemester } = useSharedState();
  const searchResults = use(searchResultsPromise);
  const semesters = use(FiltersContext).semesters;
  const chosenSemesters = use(FiltersContext).chosenSemesters;
  const setChosenSemesters = use(FiltersContext).setChosenSemesters;
  const chosenSectionTypes = use(FiltersContext).chosenSectionTypes;
  const setChosenSectionTypes = use(FiltersContext).setChosenSectionTypes;
  const sectionTypes = use(FiltersContext).sectionTypes;

  const MAX_NUM_RECENT_SEMESTERS = 4; // recentSemesters will have up to the last 4 long-semesters
  const recentSemesters = getRecentSemesters(); // recentSemesters contains semesters offered in the last 2 years; recentSemesters.length = [0, 4] range

  const searchParams = useSearchParams();
  const pathname = usePathname();

  let minGPA = searchParams.get('minGPA') ?? '';
  if (Array.isArray(minGPA)) {
    minGPA = minGPA[0]; // if minGPA is an array, make it a string
  }
  let minRating = searchParams.get('minRating') ?? '';
  if (Array.isArray(minRating)) {
    minRating = minRating[0]; // if minRating is an array, make it a string
  }
  const filterNextSem = searchParams.get('availability') === 'true';

  function getRecentSemesters() {
    // get current month and year
    const today = new Date();
    const mm = today.getMonth() + 1; // January is 1
    let yyyy = today.getFullYear();

    let season = 'F';
    if (mm <= 5)
      // jan - may
      season = 'S';
    else season = 'F';

    // generate recent semesters dynamically from the current day
    const recentSemesters: string[] = [];
    for (let i = MAX_NUM_RECENT_SEMESTERS; i >= 1; i--) {
      if (season === 'S') {
        // then the previous semester is last year's Fall
        yyyy = yyyy - 1;
        season = 'F';
      } else {
        // then the previous long-semester is this year's Spring
        season = 'S';
      }

      recentSemesters.push(yyyy.toString().substring(2) + season);
    }

    return recentSemesters.filter((value) => semesters.includes(value));
  }

  const gradeCounts: Record<string, number> = {};
  const rmpCounts: Record<string, number> = {};

  const semFilteredResults = searchResults.filter((result) => {
    const availableThisSemester =
      filterNextSem &&
      result.sections.some(
        (section) => section.academic_session.name === latestSemester,
      );
    const hasChosenSectionTypes = result.grades.some((section) =>
      section.data.some((s) => chosenSectionTypes.includes(s.type)),
    );
    return (
      (result.grades.length === 0 &&
        chosenSemesters.length === semesters.length &&
        chosenSectionTypes.length === sectionTypes.length) ||
      (result.grades.some((s) => chosenSemesters.includes(s._id)) &&
        hasChosenSectionTypes) ||
      availableThisSemester
    );
  });

  minGPAs.forEach((gpaString) => {
    const gpaNum = parseFloat(gpaString);
    gradeCounts[gpaString] = semFilteredResults.filter((result) => {
      if (result.type !== 'course') {
        if (
          typeof minRating === 'string' &&
          result.RMP &&
          result.RMP.avgRating < parseFloat(minRating)
        )
          return false;
      }
      const courseGrades = result.grades;
      return (
        (courseGrades &&
          calculateGrades(courseGrades, chosenSemesters, chosenSectionTypes)
            .gpa >= gpaNum) ||
        (courseGrades === undefined &&
          chosenSemesters.length === semesters.length &&
          chosenSectionTypes.length === sectionTypes.length)
      );
    }).length;
  });

  minRatings.forEach((ratingString) => {
    const ratingNum = parseFloat(ratingString);
    rmpCounts[ratingString] = semFilteredResults.filter((result) => {
      // gpa filter
      const calculated = calculateGrades(
        result.grades,
        chosenSemesters,
        chosenSectionTypes,
      );
      if (typeof minGPA === 'string' && calculated.gpa < parseFloat(minGPA))
        return false;
      if (
        typeof ratingNum === 'number' &&
        result.type !== 'course' &&
        result.RMP &&
        result.RMP.avgRating < ratingNum
      )
        return false;
      return true;
    }).length;
  });

  function displaySectionTypeName(id: string): string {
    const SectionTypesMap: Record<string, string> = {
      '0xx': 'Normal day lecture',
      '0Wx': 'Online class',
      '0Hx': 'Hybrid day class (online + face-to-face)',
      '0Lx': 'LLC-only section',
      '5Hx': 'Hybrid night class (online + face-to-face)',
      '1xx': 'Lab section (sciences)',
      '2xx': 'Discussion section (humanities)',
      '3xx': 'Problem section (maths)',
      '5xx': 'Night lecture (past 5 PM)',
      '6xx': 'Lab night section (past 7 PM)',
      '7xx': 'Exam section',
      HNx: 'Honors-only',
      HON: 'Honors-only',
      xUx: 'Summer Class',
    };

    return SectionTypesMap[id] || id; // Default to ID if no mapping exists
  }

  return (
    <Grid
      container
      spacing={2}
      data-tutorial-id="filters"
      className="mb-4 sm:m-0"
    >
      {/* min letter grade dropdown*/}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <Tooltip title={'Select Minimum Letter Grade Average'} placement="top">
          <FormControl
            size="small"
            className={`w-full ${
              minGPA
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <InputLabel id="minGPA">Min Letter Grade</InputLabel>
            <Select
              label="Min Letter Grade"
              labelId="minGPA"
              value={minGPA}
              onChange={(event: SelectChangeEvent) => {
                const params = new URLSearchParams(searchParams.toString());
                const newValue = event.target.value;
                if (newValue !== '') {
                  params.set('minGPA', newValue);
                } else {
                  params.delete('minGPA');
                }
                window.history.replaceState(
                  null,
                  '',
                  `${pathname}?${params.toString()}`,
                );
              }}
              renderValue={(value) => gpaToLetterGrade(Number(value))}
            >
              <MenuItem className="h-10" value="">
                <em>None</em>
              </MenuItem>
              {/* dropdown options*/}
              {minGPAs.map((value) => (
                <MenuItem className="h-10" key={value} value={value}>
                  <span className="w-5">{gpaToLetterGrade(Number(value))}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    ({gradeCounts[value] ?? 0})
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </Grid>

      {/* min rating dropdown*/}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <Tooltip title={'Select Minimum Professor Rating'} placement="top">
          <FormControl
            size="small"
            className={`w-full ${
              minRating
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <InputLabel id="minRating">Min Rating</InputLabel>
            <Select
              label="Min Rating"
              labelId="minRating"
              value={minRating}
              onChange={(event: SelectChangeEvent) => {
                const params = new URLSearchParams(searchParams.toString());
                const newValue = event.target.value;
                if (newValue !== '') {
                  params.set('minRating', newValue);
                } else {
                  params.delete('minRating');
                }
                window.history.replaceState(
                  null,
                  '',
                  `${pathname}?${params.toString()}`,
                );
              }}
              renderValue={(value) => (
                <Rating
                  key={value}
                  defaultValue={Number(value)}
                  precision={0.5}
                  sx={{ fontSize: 18 }}
                  readOnly
                />
              )}
            >
              <MenuItem className="h-10" value="">
                <em>None</em>
              </MenuItem>
              {/* dropdown options*/}
              {minRatings.map((value) => (
                <MenuItem className="h-10" key={value} value={value}>
                  <Rating
                    defaultValue={Number(value)}
                    precision={0.5}
                    sx={{ fontSize: 25 }}
                    readOnly
                  />{' '}
                  <span className="text-sm text-gray-400 ml-2">
                    ({rmpCounts[value] ?? 0})
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </Grid>

      {/* semester dropdown */}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <Tooltip
          title={'Select Semesters to Include Grades from'}
          placement="top"
        >
          <FormControl
            size="small"
            className={`w-full ${
              chosenSemesters.length !== semesters.length
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <InputLabel id="Semesters">Semesters</InputLabel>
            <Select
              label="Semesters"
              labelId="Semesters"
              multiple
              value={chosenSemesters}
              onChange={(event) => {
                const {
                  target: { value },
                } = event;
                if (value.includes('select-all')) {
                  if (chosenSemesters.length === semesters.length) {
                    setChosenSemesters([]);
                  } else {
                    setChosenSemesters(semesters);
                  }
                } else if (value.includes('recent')) {
                  if (
                    chosenSemesters.length === recentSemesters.length &&
                    chosenSemesters.every((el) => recentSemesters.includes(el))
                  ) {
                    setChosenSemesters(semesters);
                  } else {
                    setChosenSemesters(recentSemesters);
                  }
                } else {
                  {
                    /*If all semesters were selected, select only clicked semester*/
                  }
                  if (chosenSemesters.length === semesters.length) {
                    const clickedItem = chosenSemesters.find(
                      (x) => !value.includes(x),
                    );
                    if (clickedItem) {
                      setChosenSemesters([clickedItem]);
                    }
                  } else {
                    setChosenSemesters(value as string[]);
                  }
                }
              }}
              renderValue={(selected) => {
                if (chosenSemesters.length === semesters.length) {
                  return 'All selected';
                }
                return selected.sort(compareSemesters).join(', ');
              }}
              MenuProps={{ autoFocus: false }}
            >
              {/* select all sessions */}
              <MenuItem className="h-10 items-center" value="select-all">
                <Checkbox
                  checked={
                    semesters.length > 0 &&
                    chosenSemesters.length === semesters.length
                  }
                  indeterminate={
                    chosenSemesters.length !== semesters.length &&
                    chosenSemesters.length !== 0 &&
                    !(
                      chosenSemesters.length === recentSemesters.length &&
                      chosenSemesters.every((el) =>
                        recentSemesters.includes(el),
                      )
                    ) // select-all is not indeterminate when recent is checked
                  }
                  disabled={semesters.length == 0}
                />
                <ListItemText
                  className={semesters.length > 0 ? '' : 'text-gray-400'}
                  primary="Select All"
                />
              </MenuItem>

              {/* recent sessions -- last <recentSemesters.length> long-semesters from current semester*/}
              <MenuItem className="h-10 items-center" value="recent">
                <Checkbox
                  checked={
                    recentSemesters.length > 0 &&
                    chosenSemesters.length === recentSemesters.length &&
                    chosenSemesters.every((el) => recentSemesters.includes(el))
                  }
                  disabled={recentSemesters.length == 0}
                />
                <ListItemText
                  className={recentSemesters.length > 0 ? '' : 'text-gray-400'}
                  primary="Recent"
                />
              </MenuItem>

              {/* individual options */}
              {semesters.map((session) => (
                <MenuItem
                  className="h-10 items-center"
                  key={session}
                  value={session}
                >
                  <Checkbox checked={chosenSemesters.includes(session)} />
                  <ListItemText primary={displaySemesterName(session)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </Grid>

      {/* section type dropdown */}
      <Grid size={{ xs: 6, sm: 12 / 5 }} className="px-2">
        <Tooltip
          title={'Select Section Types to Include Grades from'}
          placement="top"
        >
          <FormControl
            size="small"
            className={`w-full ${
              chosenSectionTypes.length !== sectionTypes.length
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <InputLabel id="SectionTypes">Section Types</InputLabel>
            <Select
              label="Section Types"
              labelId="SectionTypes"
              multiple
              value={chosenSectionTypes}
              onChange={(event) => {
                const {
                  target: { value },
                } = event;
                if (value.includes('select-all')) {
                  if (chosenSectionTypes.length === sectionTypes.length) {
                    setChosenSectionTypes([]);
                  } else {
                    setChosenSectionTypes(sectionTypes);
                  }
                } else {
                  if (chosenSectionTypes.length === sectionTypes.length) {
                    const clickedItem = chosenSectionTypes.find(
                      (x) => !value.includes(x),
                    );
                    if (clickedItem) {
                      setChosenSectionTypes([clickedItem]);
                    }
                  } else {
                    setChosenSectionTypes(value as string[]);
                  }
                }
              }}
              renderValue={(selected) => {
                if (chosenSectionTypes.length === sectionTypes.length) {
                  return 'All selected';
                }
                return selected.sort().join(', ');
              }}
              MenuProps={{ autoFocus: false }}
            >
              {/* select all section types */}
              <MenuItem className="h-10 items-center" value="select-all">
                <Checkbox
                  checked={
                    sectionTypes.length > 0 &&
                    chosenSectionTypes.length === sectionTypes.length
                  }
                  indeterminate={
                    chosenSectionTypes.length !== sectionTypes.length &&
                    chosenSectionTypes.length !== 0
                  }
                  disabled={sectionTypes.length == 0}
                />
                <ListItemText
                  className={sectionTypes.length > 0 ? '' : 'text-gray-400'}
                  primary="Select All"
                />
              </MenuItem>

              {/* individual options */}
              {sectionTypes.map((t) => (
                <MenuItem className="h-10 items-center" key={t} value={t}>
                  <Checkbox checked={chosenSectionTypes.includes(t)} />
                  <ListItemText primary={displaySectionTypeName(t)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </Grid>

      {/* Teaching Next Semester switch*/}
      <Grid size={{ xs: 12, sm: 12 / 5 }} className="px-2">
        <Tooltip title="Select Availability" placement="top">
          <FormControl
            size="small"
            className={`${
              filterNextSem
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={filterNextSem}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (event.target.checked) {
                      params.set('availability', 'true');
                    } else {
                      params.delete('availability');
                    }
                    window.history.replaceState(
                      null,
                      '',
                      `${pathname}?${params.toString()}`,
                    );
                  }}
                />
              }
              label={
                latestSemester == ''
                  ? 'Teaching Next Semester'
                  : 'Teaching in ' + displaySemesterName(latestSemester, false)
              }
            />
          </FormControl>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
