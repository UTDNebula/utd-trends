'use client';

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
import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import Rating from '@/components/common/Rating/Rating';
import untypedComboTable from '@/data/combo_table.json';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { compareSemesters, displaySemesterName } from '@/modules/semesters';
import useHasHydrated from '@/modules/useHasHydrated';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/types/SearchQuery';

const minGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

export function LoadingFilters() {
  return (
    <Grid container spacing={2} className="mb-4 sm:m-0">
      {/* min letter grade dropdown*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="minGPA">Min Letter Grade</InputLabel>
          <Select label="Min Letter Grade" labelId="minGPA" value=""></Select>
        </FormControl>
      </Grid>

      {/* min rating dropdown*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="minRating">Min Rating</InputLabel>
          <Select label="Min Rating" labelId="minRating" value=""></Select>
        </FormControl>
      </Grid>

      {/* semester dropdown */}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <InputLabel id="Semesters">Semesters</InputLabel>
          <Select label="Semesters" labelId="Semesters" value=""></Select>
        </FormControl>
      </Grid>

      {/* Teaching Next Semester switch*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
        <FormControl
          size="small"
          className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black"
        >
          <FormControlLabel
            control={<Switch checked={true} />}
            label="Teaching Next Semester"
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
}
const comboTable = untypedComboTable as { [key: string]: SearchQuery[] };

/**
 * This component returns a set of filters with which to sort results.
 */
export default function Filters(props: Props) {
  const {
    semesters,
    chosenSemesters,
    setChosenSemesters,
    latestSemester,
    grades,
    rmp,
  } = useSharedState();

  const MAX_NUM_RECENT_SEMESTERS = 4; // recentSemesters will have up to the last 4 long-semesters
  const recentSemesters = getRecentSemesters(); // recentSemesters contains semesters offered in the last 2 years; recentSemesters.length = [0, 4] range

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // To avoid hydration errors
  const hasHydrated = useHasHydrated();
  if (!hasHydrated) {
    return <LoadingFilters />;
  }

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

  function fetchSearchResults( // took from clientleft.tsx so I didn't need to pass it in as a prop
    searchTerms: SearchQuery[],
    filterTerms: SearchQuery[],
  ) {
    return searchTerms
      .flatMap((searchTerm) =>
        [searchTerm].concat(
          comboTable[searchQueryLabel(searchTerm)].map((combo) => ({
            ...searchTerm,
            ...combo,
          })),
        ),
      )
      .filter(
        (searchTerm) =>
          !filterTerms.length ||
          filterTerms.find(
            (filterTerm) =>
              searchQueryEqual(convertToCourseOnly(searchTerm), filterTerm) ||
              searchQueryEqual(convertToProfOnly(searchTerm), filterTerm),
          ),
      );
  }

  let results: SearchQuery[] = [];
  if (props.courses.length > 0) {
    results = fetchSearchResults(props.courses, props.professors);
  } else if (props.professors.length > 0) {
    results = fetchSearchResults(props.professors, []);
  }
  const gradeCounts: Record<string, number> = {};
  const rmpCounts: Record<string, number> = {};

  minGPAs.forEach((gpaString) => {
    const gpaNum = parseFloat(gpaString);
    gradeCounts[gpaString] = results.filter((result) => {
      const courseGrades = grades[searchQueryLabel(result)];
      const profRatings = rmp?.[searchQueryLabel(convertToProfOnly(result))];
      const passesRating =
        !minRating ||
        (profRatings?.message === 'success' &&
          profRatings.data.avgRating >= parseFloat(minRating));
      return (
        courseGrades &&
        courseGrades.message === 'success' &&
        courseGrades.data.filtered.gpa >= gpaNum &&
        passesRating
      );
    }).length;
  });

  minRatings.forEach((ratingString) => {
    const ratingNum = parseFloat(ratingString);
    rmpCounts[ratingString] = results.filter((result) => {
      const profRatings = rmp?.[searchQueryLabel(convertToProfOnly(result))];
      const courseGrades = grades[searchQueryLabel(result)];
      const passesGPA =
        !minGPA ||
        (courseGrades?.message === 'success' &&
          courseGrades.data.filtered.gpa >= parseFloat(minGPA));
      return (
        profRatings &&
        profRatings.message === 'success' &&
        profRatings.data.avgRating >= ratingNum &&
        passesGPA
      );
    }).length;
  });

  return (
    <Grid
      container
      spacing={2}
      data-tutorial-id="filters"
      className="mb-4 sm:m-0"
    >
      {/* min letter grade dropdown*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
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
                  <span className="text-sm text-gray-400 ml-1">
                    ({gradeCounts[value] ?? 0})
                  </span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
      </Grid>

      {/* min rating dropdown*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
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
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
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
              onChange={(event: SelectChangeEvent<string[]>) => {
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
                  setChosenSemesters(value as string[]);
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

      {/* Teaching Next Semester switch*/}
      <Grid size={{ xs: 6, sm: 3 }} className="px-2">
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
                'Teaching ' +
                (typeof latestSemester !== 'undefined' &&
                latestSemester.message === 'success'
                  ? 'in ' + displaySemesterName(latestSemester.data, false)
                  : 'Next Semester')
              }
            />
          </FormControl>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
