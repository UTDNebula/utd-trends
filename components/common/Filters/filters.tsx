import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

/**
 * This component returns a set of filters with which to sort results.
 */

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
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        size="small"
        className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
      >
        <InputLabel id="minRating">Minimum Rating</InputLabel>
        <Select label="Minimum Rating" labelId="minRating">
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <FormControl
        fullWidth
        size="small"
        className="[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti"
      >
        <InputLabel id="maxDiff">Maximum Difficulty</InputLabel>
        <Select label="Maximum Difficulty" labelId="maxDiff">
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Filters;
