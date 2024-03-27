import { Autocomplete, TextField } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  selectSearchValue: (chosenOption: SearchQuery[]) => void;
  className?: string;
  input_className?: string;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
  const [options, setOptions] = useState<SearchQuery[]>([]);
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState<SearchQuery[]>([]);

  function loadNewOptions(newInputValue: string) {
    setLoading(true);
    if (newInputValue.trim() === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    const courseSelected =
      value.findIndex((el) => 'prefix' in el && 'number' in el) !== -1;
    const controller = new AbortController();
    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=' +
        (courseSelected ? 'professor' : 'both'),
      {
        signal: controller.signal,
        method: 'GET',
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        const filtered = data.data.filter(
          (item: SearchQuery) =>
            value.findIndex((el) => searchQueryEqual(el, item)) === -1,
        );
        if (
          filtered.length === 1 &&
          newInputValue.charAt(newInputValue.length - 1) === ' '
        ) {
          addValue(filtered[0]);
          setOptions([]);
        } else {
          setOptions(filtered);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          // ignore aborts
        } else {
          console.log(error);
        }
      });
  }

  function addValue(newValue: SearchQuery) {
    setValue((old) => [...old, newValue]);
    setOptions((old) =>
      old.filter((item) => !searchQueryEqual(newValue, item)),
    );
    setInputValue('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === ' ') {
      if (
        event.target !== null &&
        (event.target as HTMLInputElement).value.length > 0 &&
        options.length === 1
      ) {
        event.preventDefault();
        event.stopPropagation();
        addValue(options[0]);
      }
    } else if (event.key === 'Enter' && inputValue === '') {
      event.preventDefault();
      event.stopPropagation();
      props.selectSearchValue(value);
    }
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      loading={loading}
      autoHighlight={true}
      clearOnBlur={false}
      className={props.className}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return searchQueryLabel(option);
      }}
      options={options}
      filterOptions={(options) => options}
      value={value}
      onChange={(
        event: React.SyntheticEvent,
        newValue: (string | SearchQuery)[],
      ) => {
        if (!newValue.every((el) => typeof el !== 'string')) {
          return;
        }
        setValue(newValue as SearchQuery[]);
        setOptions((old) =>
          old.filter(
            (item) => !searchQueryEqual(newValue[0] as SearchQuery, item),
          ),
        );
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        loadNewOptions(newInputValue);
      }}
      renderInput={(params) => {
        params.inputProps.onKeyDown = handleKeyDown;
        return (
          <TextField
            {...params}
            variant="outlined"
            className={
              '[&>.MuiInputBase-root]:bg-white [&>.MuiInputBase-root]:dark:bg-haiti ' +
              (typeof props.input_className !== 'undefined'
                ? props.input_className
                : '')
            }
            placeholder="ex. CS 1200"
          />
        );
      }}
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
                  'whitespace-pre-wrap' + (part.highlight ? ' font-bold' : '')
                }
              >
                {part.text}
              </span>
            ))}
          </li>
        );
      }}
    />
  );
};

SplashPageSearchBar.defaultProps = {
  disabled: true,
};
