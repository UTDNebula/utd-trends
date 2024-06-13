import { FormControl, InputLabel, MenuItem } from '@mui/material';
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
}

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = (props: FiltersProps) => {
  const [minGPA, setMinGPA] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxDiff, setMaxDiff] = useState('');

  //set value from query
  const router = useRouter();
  useEffect(() => {
    if (props.manageQuery) {
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
    if (props.manageQuery && router.isReady) {
      const newQuery = router.query;
      if (newValue !== '') {
        newQuery[toSet] = newValue;
      } else {
        delete newQuery[toSet];
      }
      router.replace(
        {
          pathname: props.path,
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    }
    if (typeof props.changeValue !== 'undefined') {
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
      props.changeValue(newSet);
    }
  }

  return (
    <div className={'flex gap-2 ' + props.className ?? ''}>
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
    </div>
  );
};

export default Filters;
