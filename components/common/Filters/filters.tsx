import { MenuItem, Select } from '@mui/material';
import React from 'react';

/**
 * This component returns a set of filters with which to sort results.
 */
const Filters = () => {
  return (
    <div>
      <Select label="Age">
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </div>
  );
};

export default Filters;
