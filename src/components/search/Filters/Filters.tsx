import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Rating from '@/components/common/Rating/Rating';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade/gpaToLetterGrade';

const minGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

interface FiltersProps {
  manageQuery?: boolean;
  academicSessions: string[];
  chosenSessions: string[];
  addChosenSessions: (arg0: (arg0: string[]) => string[]) => void;
  courseType: string[];
  addChosenCourseType: (arg0: (arg0: string[]) => string[]) => void;
  chosenCourseType: string[];
}

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = ({
  manageQuery,
  academicSessions,
  chosenSessions,
  addChosenSessions,
  courseType,
  addChosenCourseType,
  chosenCourseType,
}: FiltersProps) => {
  const [minGPA, setMinGPA] = useState('');
  const [minRating, setMinRating] = useState('');
  const MAX_NUM_RECENT_SEMESTERS = 4; // recentSemesters will have up to the last 4 long-semesters
  const recentSemesters = getRecentSemesters(); // recentSemesters contains semesters offered in the last 2 years; recentSemesters.length = [0, 4] range
  academicSessions.sort((a, b) => compareSemesters(b, a)); // display the semesters in order of recency (most recent first)

  //set value from query
  const router = useRouter();
  useEffect(() => {
    if (manageQuery) {
      if (router.isReady && typeof router.query.searchTerms !== 'undefined') {
        if (typeof router.query.minGPA === 'string') {
          setMinGPA(router.query.minGPA);
        }
        if (typeof router.query.minRating === 'string') {
          setMinRating(router.query.minRating);
        }
      }
    }
  }, [router.isReady, router.query.minGPA, router.query.minRating]);

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

    return recentSemesters.filter((value) => academicSessions.includes(value));
  }

  //Update URL, state, and parent
  async function onChange(
    newValue: string,
    toSet: 'minGPA' | 'minRating',
    setter: (value: string) => void,
  ) {
    setter(newValue);
    if (manageQuery && router.isReady) {
      const newQuery = { ...router.query };
      if (newValue !== '') {
        newQuery[toSet] = newValue;
      } else {
        delete newQuery[toSet];
      }
      await router.replace(
        {
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }

  function displayAcademicSessionName(id: string) {
    return (
      '20' +
      id.slice(0, 2) +
      ' ' +
      { U: 'Summer', F: 'Fall', S: 'Spring' }[id.slice(2)]
    );
  }

  function displayCourseTypeName(id: string): string {
    const courseTypeMap: Record<string, string> = {
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
    };

    return courseTypeMap[id] || id; // Default to ID if no mapping exists
  }

  function compareSemesters(a: string, b: string) {
    const x = a.substring(0, 2).localeCompare(b.substring(0, 2));
    if (x == 0) {
      const a_char = a[2];
      const b_char = b[2];
      // a_char and b_char cannot both be the same semester because x == 0
      if (a_char == 'S') return -1;
      if (a_char == 'U' && b_char == 'S') return 1;
      if (a_char == 'U' && b_char == 'F') return -1;
      if (a_char == 'F') return 1;
      return 0;
    } else return x;
  }

  return (
    <div className="flex gap-2">
      {/* min letter grade dropdown*/}
      <Tooltip title={'Select Minimum Letter Grade Average'} placement="top">
        <FormControl
          size="small"
          className={`w-full ${
            minGPA
              ? '[&>.MuiInputBase-root]:bg-cornflower-50 [&>.MuiInputBase-root]:dark:bg-cornflower-900'
              : '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-black'
          }`}
        >
          <InputLabel id="minGPA">Min Letter Grade</InputLabel>
          <Select
            label="Min Letter Grade"
            labelId="minGPA"
            value={minGPA}
            onChange={async (event: SelectChangeEvent) => {
              await onChange(event.target.value, 'minGPA', setMinGPA);
            }}
          >
            <MenuItem className="h-10" value="">
              <em>None</em>
            </MenuItem>
            {/* dropdown options*/}
            {minGPAs.map((value) => (
              <MenuItem className="h-10" key={value} value={value}>
                {gpaToLetterGrade(Number(value))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {/* min rating dropdown*/}
      <Tooltip title={'Select Minimum Professor Rating'} placement="top">
        <FormControl
          size="small"
          className={`w-full ${
            minRating
              ? '[&>.MuiInputBase-root]:bg-cornflower-50 [&>.MuiInputBase-root]:dark:bg-cornflower-900'
              : '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-black'
          }`}
        >
          <InputLabel id="minRating">Min Rating</InputLabel>
          <Select
            label="Min Rating"
            labelId="minRating"
            value={minRating}
            onChange={async (event: SelectChangeEvent) => {
              await onChange(event.target.value, 'minRating', setMinRating);
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
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {/* semester dropdown */}
      <Tooltip
        title={'Select Semesters to Include Grades from'}
        placement="top"
      >
        <FormControl
          size="small"
          className={`w-full ${
            chosenSessions.length !== academicSessions.length
              ? '[&>.MuiInputBase-root]:bg-cornflower-50 [&>.MuiInputBase-root]:dark:bg-cornflower-900'
              : '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-black'
          }`}
        >
          <InputLabel id="Semesters">Semesters</InputLabel>
          <Select
            label="Semesters"
            labelId="Semesters"
            multiple
            value={chosenSessions}
            onChange={(event: SelectChangeEvent<string[]>) => {
              const {
                target: { value },
              } = event;
              console.log('semester value: ', value);
              if (value.includes('select-all')) {
                if (chosenSessions.length === academicSessions.length) {
                  addChosenSessions(() => []);
                } else {
                  addChosenSessions(() => academicSessions);
                }
              } else if (value.includes('recent')) {
                if (
                  chosenSessions.length === recentSemesters.length &&
                  chosenSessions.every((el) => recentSemesters.includes(el))
                ) {
                  addChosenSessions(() => academicSessions);
                } else {
                  addChosenSessions(() => recentSemesters);
                }
              } else {
                addChosenSessions(() => value as string[]);
              }
            }}
            renderValue={(selected) => {
              if (chosenSessions.length === academicSessions.length) {
                return 'All selected';
              }
              return selected.sort((a, b) => compareSemesters(a, b)).join(', ');
            }}
            MenuProps={{ autoFocus: false }}
          >
            {/* select all sessions */}
            <MenuItem className="h-10 items-center" value="select-all">
              <Checkbox
                checked={
                  academicSessions.length > 0 &&
                  chosenSessions.length === academicSessions.length
                }
                indeterminate={
                  chosenSessions.length !== academicSessions.length &&
                  chosenSessions.length !== 0 &&
                  !(
                    chosenSessions.length === recentSemesters.length &&
                    chosenSessions.every((el) => recentSemesters.includes(el))
                  ) // select-all is not indeterminate when recent is checked
                }
                disabled={academicSessions.length == 0}
              />
              <ListItemText
                className={academicSessions.length > 0 ? '' : 'text-gray-400'}
                primary="Select All"
              />
            </MenuItem>

            {/* recent sessions -- last <recentSemesters.length> long-semesters from current semester*/}
            <MenuItem className="h-10 items-center" value="recent">
              <Checkbox
                checked={
                  recentSemesters.length > 0 &&
                  chosenSessions.length === recentSemesters.length &&
                  chosenSessions.every((el) => recentSemesters.includes(el))
                }
                disabled={recentSemesters.length == 0}
              />
              <ListItemText
                className={recentSemesters.length > 0 ? '' : 'text-gray-400'}
                primary="Recent"
              />
            </MenuItem>

            {/* individual options */}
            {academicSessions.map((session) => (
              <MenuItem
                className="h-10 items-center"
                key={session}
                value={session}
              >
                <Checkbox checked={chosenSessions.includes(session)} />
                <ListItemText primary={displayAcademicSessionName(session)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>
      {/* Course Type dropdown */}

      <Tooltip title={'Select Course Type to choose from'} placement="top">
        <FormControl
          size="small"
          className={`w-full ${
            chosenSessions.length !== courseType.length
              ? '[&>.MuiInputBase-root]:bg-cornflower-50 [&>.MuiInputBase-root]:dark:bg-cornflower-900'
              : '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-black'
          }`}
        >
          <InputLabel id="Semesters">CourseType</InputLabel>
          <Select
            label="Semesters"
            labelId="Semesters"
            multiple
            value={chosenCourseType}
            onChange={(event: SelectChangeEvent<string[]>) => {
              const {
                target: { value },
              } = event;
              if (value.includes('select-all')) {
                if (chosenCourseType.length === courseType.length) {
                  addChosenCourseType(() => []);
                } else {
                  addChosenCourseType(() => courseType);
                }
              } else {
                addChosenCourseType(() => value as string[]);
              }
            }}
            renderValue={(selected) => {
              if (chosenCourseType.length === courseType.length) {
                return 'All selected';
              }
              return selected.join(', ');
            }}
            MenuProps={{ autoFocus: false }}
          >
            {/* select all courseTypes */}
            <MenuItem className="h-10 items-center" value="select-all">
              <Checkbox
                checked={
                  courseType.length > 0 &&
                  chosenCourseType.length === courseType.length
                }
                indeterminate={
                  chosenCourseType.length !== courseType.length &&
                  chosenCourseType.length !== 0
                }
                disabled={courseType.length == 0}
              />
              <ListItemText
                className={courseType.length > 0 ? '' : 'text-gray-400'}
                primary="Select All"
              />
            </MenuItem>
            {/* individual options */}
            {courseType.map((type) => (
              <MenuItem className="h-10 items-center" key={type} value={type}>
                <Checkbox checked={chosenCourseType.includes(type)} />
                <ListItemText primary={displayCourseTypeName(type)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>
    </div>
  );
};

export default Filters;
