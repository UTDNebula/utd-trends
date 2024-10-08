import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import Rating from '../Rating/rating';

const minGPAs = [
  ['3.67', 'A-'],
  ['3.33', 'B+'],
  ['3', 'B'],
  ['2.67', 'B-'],
  ['2.33', 'C+'],
  ['2', 'C'],
];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];

interface FiltersProps {
  manageQuery?: boolean;
  className?: string;
  academicSessions?: string[];
  chosenSessions?: string[];
  addChosenSessions?: (arg0: (arg0: string[]) => string[]) => void;
}

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = ({
  manageQuery,
  className,
  academicSessions,
  chosenSessions,
  addChosenSessions,
}: FiltersProps) => {
  const [minGPA, setMinGPA] = useState('');
  const [minRating, setMinRating] = useState('');

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
  }, [router.isReady, router.query.minGPA, router.query.minRating]); // useEffect is called on query update (so on back navigation, the filters selected are set based on the url)

  //Update URL, state, and parent
  function onChange(
    newValue: string,
    toSet: 'minGPA' | 'minRating',
    setter: (value: string) => void,
  ) {
    setter(newValue);
    if (manageQuery && router.isReady) {
      const newQuery = router.query;
      if (newValue !== '') {
        newQuery[toSet] = newValue;
      } else {
        delete newQuery[toSet];
      }
      router.replace(
        {
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }

  //All of these must be defined to work
  typeof academicSessions !== 'undefined' &&
    typeof chosenSessions !== 'undefined' &&
    typeof addChosenSessions !== 'undefined';

  //handle select all options for semester
  const selectAll = (selectAll: boolean) => {
    if (selectAll) {
      addChosenSessions(() => academicSessions ?? []);
    } else {
      addChosenSessions(() => []);
    }
  };

  //handle recent semester options for semester
  const selectRecent = () => {
    const recentSessions = academicSessions?.slice(0, 3) ?? [];
    addChosenSessions(() => recentSessions);
  };

  return (
    <div className={'flex flex-col gap-2 ' + (className ?? '')}>
      <div className="flex gap-2">
        {/* min GPA dropdown*/}
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        >
          <InputLabel id="minGPA">Min Letter Grade</InputLabel>
          <Select
            label="Min Letter Grade"
            labelId="minGPA"
            value={minGPA}
            onChange={(event: SelectChangeEvent) => {
              onChange(event.target.value, 'minGPA', setMinGPA);
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {/* dropdown options*/}
            {minGPAs.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* min rating dropdown*/}
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        >
          <InputLabel id="minRating">Min Rating</InputLabel>
          <Select
            label="Min Rating"
            labelId="minRating"
            value={minRating}
            onChange={(event: SelectChangeEvent) => {
              onChange(event.target.value, 'minRating', setMinRating);
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
            <MenuItem value="">
              <em>None</em>
            </MenuItem>{' '}
            {/* dropdown options*/}
            {minRatings.map((value) => (
              <MenuItem key={value} value={value}>
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

        {/* semester dropdown */}
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        >
          <InputLabel id="Semester">Semester</InputLabel>
          <Select
            label="Semester"
            labelId="Semester"
            value={chosenSessions ?? []}
            onChange={(event: SelectChangeEvent<string[]>) => {
              const value = event.target.value as string[];
              addChosenSessions(() => value);
            }}
            renderValue={(selected) =>
              selected.length > 0 ? 'Semester' : 'Select a semester'
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 400, // Adjust this height as necessary
                  width: 'auto',
                  transform: 'translateY(10px)', // This moves the dropdown down
                },
              },
            }}
          >
            {/* select all sessions */}
            <MenuItem value="select-all">
              <Checkbox
                checked={chosenSessions?.length === academicSessions?.length}
                onClick={() => selectAll(true)}
              />
              <ListItemText primary="Select All" />
            </MenuItem>

            {/* recent sessions */}
            <MenuItem value="recent">
              <Checkbox
                checked={
                  JSON.stringify(chosenSessions?.slice(0, 6)) ===
                  JSON.stringify(academicSessions?.slice(0, 6))
                }
                onClick={selectRecent}
              />
              <ListItemText primary="Recent" />
            </MenuItem>

            {/* indiv options */}
            {academicSessions?.map((session) => (
              <MenuItem key={session} value={session}>
                <Checkbox checked={chosenSessions?.includes(session)} />
                <ListItemText
                  primary={
                    '20' +
                    session.slice(0, 2) +
                    ' ' +
                    { U: 'Summer', F: 'Fall', S: 'Spring' }[session.slice(2)]
                  }
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default Filters;
