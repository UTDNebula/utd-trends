import { MenuItem, Select } from '@mui/material';
import react from 'react';

/* Props type used by the SearchBar component
 */
type FilterProps = {};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the ExpandableSearchGrid component
 */
const Filters = (props: FilterProps) => {
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
