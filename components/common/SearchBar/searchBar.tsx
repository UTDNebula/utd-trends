import { Search } from '@mui/icons-material';
import { Autocomplete, InputAdornment, InputBase, Paper } from '@mui/material';
import Popper from '@mui/material/Popper';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useEffect, useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: (value: SearchQuery | null) => void;
  searchTerms: SearchQuery[];
  disabled?: boolean;
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
          if (data.message !== 'success') {
            throw new Error(data.message);
          }
          setOptions(data.data);
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
          onChange={(
            event: React.SyntheticEvent,
            newValue: SearchQuery | null,
            reason,
          ) => {
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
              className="font-sans w-full h-12 bg-primary-light text-gray-600 dark:text-gray-200 placeholder-dark"
              placeholder="Search course, professor, or both...."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="fill-primary text-4xl" />
                </InputAdornment>
              }
            />
          )}
          renderOption={(props, option, { inputValue }) => {
            const text = searchQueryLabel(option);
            //add spaces between prefix and course number
            const matches = match(
              text,
              inputValue.replace(
                /([a-zA-Z]{2,4})([0-9][0-9V]?[0-9]{0,2})/,
                '$1 $2',
              ),
            );
            const parts = parse(text, matches);
            console.log(parts);
            return (
              <li {...props}>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    className={
                      'whitespace-pre-wrap' +
                      (part.highlight ? ' font-bold' : '')
                    }
                  >
                    {part.text}
                  </span>
                ))}
              </li>
            );
          }}
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
        />
        <div className="w-8 h-8" />
      </div>
    </>
  );
};

SearchBar.defaultProps = {
  disabled: true,
};
