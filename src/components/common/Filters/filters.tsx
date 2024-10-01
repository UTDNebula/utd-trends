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

  //For academic sessions
  const [open, setOpen] = useState(false);

  //All of these must be defined to work
  const showAcademicSessions =
    typeof academicSessions !== 'undefined' &&
    typeof chosenSessions !== 'undefined' &&
    typeof addChosenSessions !== 'undefined';

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
        {showAcademicSessions && (
          <IconButton
            aria-label="expand academic session picker"
            size="small"
            onClick={() => setOpen(!open)}
            className={
              'w-10 transition-transform' +
              (open ? ' rotate-90' : ' rotate-180') +
              (academicSessions.length !== chosenSessions.length
                ? ' border-2 border-persimmon-500 border-solid'
                : '')
            }
            title={
              academicSessions.length !== chosenSessions.length
                ? 'Not showing all academic sessions'
                : 'Choose academic sessions'
            }
          >
            <KeyboardArrowIcon />
          </IconButton>
        )}
      </div>
      {showAcademicSessions && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <div className="flex flex-wrap gap-2">
            {academicSessions.map((session) => (
              <FormControlLabel
                key={session}
                control={
                  <Checkbox
                    checked={chosenSessions.includes(session)}
                    onClick={() => {
                      addChosenSessions((oldChosenSessions: string[]) => {
                        if (oldChosenSessions.includes(session)) {
                          return oldChosenSessions.filter(
                            (el) => el !== session,
                          );
                        }
                        const newSessions = oldChosenSessions.concat([session]);
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
