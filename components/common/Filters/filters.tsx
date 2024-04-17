import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = () => {
  return (
    <div className="flex gap-2">
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select label="Age" labelId="demo-simple-select-label">
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select label="Age" labelId="demo-simple-select-label">
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select label="Age" labelId="demo-simple-select-label">
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default Filters;
