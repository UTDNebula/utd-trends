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
  academicSessions: string[];
  chosenSessions: string[];
  addChosenSessions: (arg0: (arg0: string[]) => string[]) => void;
}

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = ({
  manageQuery,
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

  function displayAcademicSessionName(id: string) {
    return (
      '20' +
      id.slice(0, 2) +
      ' ' +
      { U: 'Summer', F: 'Fall', S: 'Spring' }[id.slice(2)]
    );
  }

  return (
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
            if (value.includes('select-all')) {
              if (chosenSessions.length === academicSessions.length) {
                addChosenSessions(() => []);
              } else {
                addChosenSessions(() => academicSessions);
              }
            } else {
              addChosenSessions(() => value as string[]);
            }
          }}
          renderValue={(selected) => {
            if (chosenSessions.length === academicSessions.length) {
              return 'All selected';
            }
            return selected
              .map((session) => displayAcademicSessionName(session))
              .join(', ');
          }}
          MenuProps={{autoFocus: false}}
        >
          {/* select all sessions */}
          <MenuItem value="select-all">
            <Checkbox
              checked={chosenSessions.length === academicSessions.length}
              indeterminate={
                chosenSessions.length !== academicSessions.length &&
                chosenSessions.length !== 0
              }
            />
            <ListItemText primary="Select All" />
          </MenuItem>

          {/* indiv options */}
          {academicSessions.map((session) => (
            <MenuItem key={session} value={session}>
              <Checkbox checked={chosenSessions.includes(session)} />
              <ListItemText primary={displayAcademicSessionName(session)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default Filters;
