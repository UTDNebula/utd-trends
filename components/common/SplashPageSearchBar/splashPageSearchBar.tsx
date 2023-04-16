import * as React from 'react';
import { Search } from '@mui/icons-material';
import { Autocomplete, InputBase, InputAdornment } from '@mui/material';
import { useState, useEffect } from 'react';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  selectSearchValue: Function;
  disabled?: boolean;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
  const [options, setOptions] = useState<readonly SearchQuery[]>([]);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue === '') {
      setOptions([]);
      return;
    }
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
  }, [inputValue]);

  return (
    <>
      <div className="text-primary m-auto w-11/12 -translate-y-1/4">
        <Autocomplete
          autoHighlight={true}
          disabled={props.disabled}
          className="w-full h-12"
          filterSelectedOptions
          getOptionLabel={(option) => searchQueryLabel(option)}
          options={options}
          filterOptions={(options) => options}
          // When a new option is selected return it to the parent
          // component using selectSearchValue prop
          onChange={(event: any, newValue: SearchQuery | null, reason) =>
            props.selectSearchValue(newValue)
          }
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              className="rounded-md border-primary-dark border-2 w-full h-12 px-2 bg-white text-primary-dark placeholder-primary-dark font-bold"
              placeholder="Search course, professor, or both...."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="fill-primary text-4xl" />
                </InputAdornment>
              }
            />
          )}
        />
      </div>
    </>
  );
};

SplashPageSearchBar.defaultProps = {
  disabled: true,
};
