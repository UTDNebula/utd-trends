import { Autocomplete, TextField } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import decodeSearchQueryLabel from '../../../modules/decodeSearchQueryLabel/decodeSearchQueryLabel';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../../../modules/searchQueryEqual/searchQueryEqual';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  manageQuery?: boolean;
  path?: string;
  selectValue?: (value: SearchQuery[]) => void;
  changeValue?: (value: SearchQuery[]) => void;
  className?: string;
  input_className?: string;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
const SearchBar = (props: SearchProps) => {
  //what you can choose from
  const [options, setOptions] = useState<SearchQuery[]>([]);
  //initial loading prop for first load
  const [loading, setLoading] = useState(false);

  //text in search
  const [inputValue, _setInputValue] = useState('');
  //quick input updates for fetch (state is slow)
  const quickInputValue = useRef('');
  function setInputValue(newValue: string) {
    quickInputValue.current = newValue;
    _setInputValue(newValue);
  }
  //chosen values
  const [value, setValue] = useState<SearchQuery[]>([]);

  //set value from query
  const router = useRouter();
  useEffect(() => {
    if (props.manageQuery) {
      if (router.isReady && typeof router.query.searchTerms !== 'undefined') {
        let array = router.query.searchTerms;
        if (!Array.isArray(array)) {
          array = array.split(',');
        }
        setValue(array.map((el) => decodeSearchQueryLabel(el)));
      }
    }
  }, [router.isReady]);

  //update url with what's in value
  function updateQueries(newValue: SearchQuery[]) {
    if (props.manageQuery && typeof props.path === 'string' && router.isReady) {
      if (newValue.length > 0) {
        router.replace(
          {
            pathname: props.path,
            query: {
              searchTerms: newValue.map((el) => searchQueryLabel(el)).join(','),
            },
          },
          undefined,
          { shallow: true },
        );
      } else {
        router.replace(props.path, undefined, { shallow: true });
      }
    }
  }

  //fetch new options, add tags if valid
  function loadNewOptions(newInputValue: string) {
    setLoading(true);
    if (newInputValue.trim() === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    //to allow selecting only one course
    const courseSelected =
      value.findIndex((el) => 'prefix' in el && 'number' in el) !== -1;
    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=' +
        (courseSelected ? 'professor' : 'both'),
      {
        method: 'GET',
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        //remove currently chosen values
        const filtered = data.data.filter(
          (item: SearchQuery) =>
            value.findIndex((el) => searchQueryEqual(el, item)) === -1,
        );
        //add to chosen values if only one option and space
        const noSections = filtered.filter(
          (el: SearchQuery) => !('sectionNumber' in el),
        );
        if (
          (filtered.length === 1 || noSections.length === 1) &&
          //last char is a space
          (newInputValue.charAt(newInputValue.length - 1) === ' ' ||
            //next char is a space
            quickInputValue.current.slice(newInputValue.length)[0] === ' ')
        ) {
          addValue(filtered.length === 1 ? filtered[0] : noSections[0]);
          const rest = quickInputValue.current
            .slice(newInputValue.length)
            .trimStart();
          setInputValue(rest);
          loadNewOptions(rest.trimEnd());
          setLoading(false);
        } else if (quickInputValue.current === newInputValue) {
          //still valid options
          setOptions(filtered);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException) {
          // ignore aborts
        } else {
          console.log(error);
        }
      });
  }

  //update parent and queries
  function onValueChange(newValue: SearchQuery[]) {
    if (typeof props.changeValue !== 'undefined') {
      props.changeValue(newValue);
    }
    updateQueries(newValue);
  }

  //add value
  function addValue(newValue: SearchQuery) {
    setValue((old) => {
      const oldAndNew = [...old, newValue];
      onValueChange(oldAndNew);
      return oldAndNew;
    });
  }

  //change all values
  function updateValue(newValue: SearchQuery[]) {
    setValue(newValue);
    onValueChange(newValue);
  }

  //for handling spaces, when options are already loaded
  //also returns results on enter
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === ' ') {
      const noSections = options.filter(
        (el: SearchQuery) => !('sectionNumber' in el),
      );
      if (
        event.target !== null &&
        (event.target as HTMLInputElement).value.length > 0 &&
        (options.length === 1 ||
          //all but one is a section
          noSections.length === 1)
      ) {
        event.preventDefault();
        event.stopPropagation();
        addValue(options.length === 1 ? options[0] : noSections[0]);
        setOptions([]);
        setInputValue('');
      }
    } else if (event.key === 'Enter' && inputValue === '') {
      event.preventDefault();
      event.stopPropagation();
      if (typeof props.selectValue !== 'undefined') {
        props.selectValue(value);
      }
    }
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      loading={loading}
      //highligh first option to add with enter
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
      //don't filter options, done in fetch
      filterOptions={(options) => options}
      value={value}
      onChange={(
        event: React.SyntheticEvent,
        newValue: (string | SearchQuery)[],
      ) => {
        //should never happen
        if (!newValue.every((el) => typeof el !== 'string')) {
          return;
        }
        //remove from options
        if (newValue.length > value.length) {
          setOptions((old) =>
            old.filter(
              (item) =>
                !searchQueryEqual(
                  newValue[newValue.length - 1] as SearchQuery,
                  item,
                ),
            ),
          );
        }
        updateValue(newValue as SearchQuery[]);
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
            className={props.input_className}
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

export default SearchBar;
