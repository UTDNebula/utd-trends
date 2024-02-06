import { Search } from '@mui/icons-material';
import { Autocomplete, InputAdornment, InputBase } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useEffect, useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  selectSearchValue: (chosenOption: SearchQuery | null) => void;
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
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setLoading(true);
    if (inputValue === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch('/api/autocomplete?input=' + inputValue, {
      signal: controller.signal,
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        setOptions(data.data);
        setLoading(false);
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

  useEffect(() => {
    fetch('/api/autocomplete');
  }, []);

  return (
    <>
      <div className="text-primary m-auto w-11/12 -translate-y-1/4">
        <Autocomplete
          loading={loading}
          autoHighlight={true}
          clearOnBlur={false}
          disabled={props.disabled}
          className="w-full h-12"
          getOptionLabel={(option) => searchQueryLabel(option)}
          options={options}
          filterOptions={(options) => options}
          // When a new option is selected return it to the parent
          // component using selectSearchValue prop
          onChange={(
            event: React.SyntheticEvent,
            newValue: SearchQuery | null,
          ) => props.selectSearchValue(newValue)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              className="rounded-md border-primary-dark border-2 w-full h-12 px-2 bg-light text-primary-dark placeholder-primary-dark font-bold"
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
              inputValue
                .replace(
                  //CS1200 -> CS 1200
                  /([a-zA-Z]{2,4})([0-9][0-9V]?[0-9]{0,2})/,
                  '$1 $2',
                )
                .replace(
                  //1200CS -> 1200 CS
                  /([0-9][0-9V][0-9]{2})([a-zA-Z]{1,4})/,
                  '$1 $2',
                ),
            );
            const parts = parse(text, matches);
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
        />
      </div>
    </>
  );
};

SplashPageSearchBar.defaultProps = {
  disabled: true,
};
