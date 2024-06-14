import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const minGPAs = ['3.5', '3.0', '2.5', '2.0', '1.5', '1.0', '0.5'];
const minRatings = ['4.5', '4', '3.5', '3', '2.5', '2', '1.5', '1', '0.5'];
const maxDiffs = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5'];

export interface FiltersType {
  minGPA?: string;
  minRating?: string;
  maxDiff?: string;
}

interface FiltersProps {
  manageQuery?: boolean;
  path?: string;
  changeValue?: (value: FiltersType) => void;
  className?: string;
  academicSessions?: string[];
  chosenSessions?: string[];
  setChosenSessions?: (arg0: (arg0: string[]) => string[]) => void;
}

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = ({
  manageQuery,
  path,
  changeValue,
  className,
  academicSessions,
  chosenSessions,
  setChosenSessions,
}: FiltersProps) => {
  const [minGPA, setMinGPA] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxDiff, setMaxDiff] = useState('');

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
        if (typeof router.query.maxDiff === 'string') {
          setMaxDiff(router.query.maxDiff);
        }
      }
    }
  }, [router.isReady]);

  function onChange(
    newValue: string,
    toSet: 'minGPA' | 'minRating' | 'maxDiff',
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
          pathname: path,
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    }
    if (typeof changeValue !== 'undefined') {
      const newSet: FiltersType = {};
      if (minGPA !== '') {
        newSet.minGPA = minGPA;
      }
      if (minRating !== '') {
        newSet.minRating = minRating;
      }
      if (maxDiff !== '') {
        newSet.maxDiff = maxDiff;
      }
      if (newValue !== '') {
        newSet[toSet] = newValue;
      } else {
        delete newSet[toSet];
      }
      changeValue(newSet);
    }
  }

  const [open, setOpen] = useState(false);

  return (
    <div className={'flex flex-col gap-2 ' + className ?? ''}>
      <div className="flex gap-2">
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        >
          <InputLabel id="minGPA">Min GPA</InputLabel>
          <Select
            label="Min GPA"
            labelId="minGPA"
            value={minGPA}
            onChange={(event: SelectChangeEvent) => {
              onChange(event.target.value, 'minGPA', setMinGPA);
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {minGPAs.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {minRatings.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          size="small"
          className="w-full [&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
        >
          <InputLabel id="maxDiff">Max Difficulty</InputLabel>
          <Select
            label="Max Difficulty"
            labelId="maxDiff"
            value={maxDiff}
            onChange={(event: SelectChangeEvent) => {
              onChange(event.target.value, 'maxDiff', setMaxDiff);
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {maxDiffs.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {typeof academicSessions !== 'undefined' && (
          <IconButton
            aria-label="expand academic session picker"
            size="small"
            onClick={() => setOpen(!open)}
            className={
              'w-10 transition-transform' +
              (open ? ' rotate-90' : ' rotate-180')
            }
          >
            <KeyboardArrowIcon />
          </IconButton>
        )}
      </div>
      {typeof academicSessions !== 'undefined' &&
        typeof chosenSessions !== 'undefined' &&
        typeof setChosenSessions !== 'undefined' && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="flex flex-wrap gap-2">
              {academicSessions.map((session) => (
                <FormControlLabel
                  key={session}
                  control={
                    <Checkbox
                      checked={chosenSessions.includes(session)}
                      onClick={() => {
                        setChosenSessions((oldChosenSessions: string[]) => {
                          if (oldChosenSessions.includes(session)) {
                            return oldChosenSessions.filter(
                              (el) => el !== session,
                            );
                          }
                          const newSessions = oldChosenSessions.concat([
                            session,
                          ]);
                          return newSessions;
                        });
                      }}
                    />
                  }
                  label={
                    '20' +
                    session.slice(0, 2) +
                    ' ' +
                    { U: 'Summer', F: 'Fall', S: 'Spring' }[session.slice(2)]
                  }
                />
              ))}
            </div>
          </Collapse>
        )}
    </div>
  );
};

export default Filters;
