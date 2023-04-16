import * as React from 'react';
import { Search } from '@mui/icons-material';
import { Autocomplete, InputBase, InputAdornment } from '@mui/material';
import Popper from '@mui/material/Popper';
import { Box, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: Function;
  searchTerms: SearchQuery[];
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
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly SearchQuery[]>([]);

  const [value, setValue] = useState<SearchQuery | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      let searchValue = inputValue;
      if (searchValue === '') {
        if (!props.searchTerms.length) {
          setOptions([]);
          return;
        }
        searchValue = searchQueryLabel(
          props.searchTerms[props.searchTerms.length - 1],
        );
      }
      const controller = new AbortController();
      fetch('/api/autocomplete?input=' + searchValue, {
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
    }
  }, [open, inputValue]);

  return (
    <>
      <div className="text-primary w-full max-w-2xl h-fit flex flex-row items-start">
        <Autocomplete
          autoHighlight={true}
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
          filterOptions={(options) =>
            options.filter((option) =>
              props.searchTerms.every(
                (searchTerm) => !searchQueryEqual(option, searchTerm),
              ),
            )
          }
          value={value}
          // When a new option is selected return it to the parent
          // component using selectSearchValue prop
          onChange={(event: any, newValue: SearchQuery | null, reason) => {
            if (reason === 'selectOption' && typeof newValue !== 'undefined') {
              props.selectSearchValue(newValue);
              setValue(null);
            }
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
              placeholder="Search course, professor, or both...."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="fill-primary text-4xl" />
                </InputAdornment>
              }
            />
          )}
          isOptionEqualToValue={(option, value) =>
            searchQueryEqual(option, value)
          }
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
        />
        <div className="w-8 h-8" />
      </div>
    </>
  );
};

SearchBar.defaultProps = {
  disabled: true,
};

function searchQueryEqual(query1: SearchQuery, query2: SearchQuery): boolean {
  if (query1.prefix !== query2.prefix) {
    return false;
  }
  if (query1.professorName !== query2.professorName) {
    return false;
  }
  if (query1.number !== query2.number) {
    return false;
  }
  if (query1.sectionNumber !== query2.sectionNumber) {
    return false;
  }
  return true;
}

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
