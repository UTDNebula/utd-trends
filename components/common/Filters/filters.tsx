import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

/**
 * This component returns a set of filters with which to sort results.
 */
const minGPAs = ['', 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5];
const minRatings = ['', 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
const maxDiffs = ['', 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];
const Filters = () => {
  return (
    <div className="flex gap-2">
      <FormControl
        fullWidth
        size="small"
        className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
      >
        <InputLabel id="minGPA">Minimum GPA</InputLabel>
        <Select label="Minimum GPA" labelId="minGPA">
          {minGPAs.map((GPA) => {
            const key = GPA === '' ? 'None' : GPA;
            const text = GPA === '' ? <em>None</em> : GPA;
            return (
              <MenuItem key={key} value={GPA}>
                {text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        size="small"
        className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
      >
        <InputLabel id="minRating">Minimum Rating</InputLabel>
        <Select label="Minimum Rating" labelId="minRating">
          {minRatings.map((Ratings) => {
            const key = Ratings === '' ? 'None' : Ratings;
            const text = Ratings === '' ? <em>None</em> : Ratings;
            return (
              <MenuItem key={key} value={Ratings}>
                {text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        size="small"
        className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
      >
        <InputLabel id="maxDiff">Maximum Difficulty</InputLabel>
        <Select label="Maximum Difficulty" labelId="maxDiff">
          {maxDiffs.map((Difficulty) => {
            const key = Difficulty === '' ? 'None' : Difficulty;
            const text = Difficulty === '' ? <em>None</em> : Difficulty;
            return (
              <MenuItem key={key} value={Difficulty}>
                {text}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

export default Filters;
