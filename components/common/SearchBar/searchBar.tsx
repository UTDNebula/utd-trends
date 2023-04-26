import { Search } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  InputAdornment,
  InputBase,
  Paper,
} from '@mui/material';
import Popper from '@mui/material/Popper';
import * as React from 'react';
import { useEffect } from 'react';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: (value: SearchQuery | null) => void;
  value: SearchQuery[];
  setValue: (value: SearchQuery[]) => void;
  disabled?: boolean;
};

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the ExpandableSearchGrid component
 */
export const SearchBar = (props: SearchProps) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly SearchQuery[]>([]);

  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/autocomplete?input=' + inputValue, {
      signal: controller.signal,
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        setOptions(data.output);
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          // ignore aborts
        } else {
          console.log(error);
        }
      });
    return () => {
      controller.abort();
    };
  }, [props.value, inputValue]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <div className="text-primary w-full max-w-2xl h-fit flex flex-row items-start">
        <Autocomplete
          autoHighlight={true}
          multiple={true}
          disabled={props.disabled}
          className="w-full h-12 bg-primary-light font-sans"
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          filterSelectedOptions
          getOptionLabel={(option) => searchQueryLabel(option)}
          options={options}
          filterOptions={(options) => options}
          value={props.value}
          // When a new option is selected, find the new selected option by getting the
          // difference between the current and new value, then return that to the parent
          // component using selectSearchValue prop
          onChange={(
            event: React.SyntheticEvent,
            newValue: SearchQuery[],
            reason,
          ) => {
            if (reason === 'removeOption') {
              return;
            }
            let difference: SearchQuery[];
            if (props.value !== undefined) {
              difference = newValue.filter((x) => !props.value.includes(x));
            } else {
              difference = newValue;
            }
            props.selectSearchValue(difference[0] ? difference[0] : null);
            props.setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              fullWidth={true}
              className="font-sans w-full h-12 bg-primary-light text-gray-600 placeholder-dark"
              placeholder="Search section number, professor name, course number...."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="fill-primary text-4xl" />
                </InputAdornment>
              }
            />
          )}
          renderOption={(props, option) => (
            <li
              {...props}
              className="bg-white/25 active:bg-white/50 focus:bg-white/50 hover:bg-white/50 my-4 mx-8 font-sans"
            >
              <Box className="cursor-pointer text-lg text-gray-600 pl-5 py-5">
                {searchQueryLabel(option)}
              </Box>
            </li>
          )}
          isOptionEqualToValue={(option, value) => {
            if (option.prefix !== value.prefix) {
              return false;
            }
            if (option.professorName !== value.professorName) {
              return false;
            }
            if (option.number !== value.number) {
              return false;
            }
            if (option.sectionNumber !== value.sectionNumber) {
              return false;
            }
            return true;
          }}
          PopperComponent={(props) => {
            return (
              <Popper {...props} className="rounded-none" placement="bottom" />
            );
          }}
          PaperComponent={({ children }) => {
            return (
              <Paper className="bg-primary-light rounded-none">
                {children}
              </Paper>
            );
          }}
          defaultValue={[]}
        />
        <div className="w-8 h-8" />
      </div>
    </>
  );
};

SearchBar.defaultProps = {
  disabled: true,
};

function searchQueryLabel(query: SearchQuery): string {
  let result = '';
  if (query.prefix !== undefined) {
    result += query.prefix;
  }
  if (query.number !== undefined) {
    result += ' ' + query.number;
  }
  if (query.sectionNumber !== undefined) {
    result += '.' + query.sectionNumber;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  return result.trim();
}
