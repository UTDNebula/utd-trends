import { Search } from '@mui/icons-material';
import { Autocomplete, InputAdornment, InputBase } from '@mui/material';
import * as React from 'react';
import { useEffect } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  selectSearchValue: (chosenOption: SearchQuery) => void;
  disabled?: boolean;
};

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
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
  }, [inputValue]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <div className="text-primary m-auto w-11/12 -translate-y-1/4">
        <Autocomplete
          autoHighlight={true}
          multiple={true}
          disabled={props.disabled}
          className="w-full h-12"
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
          // When a new option is selected, find the new selected option by getting the
          // difference between the current and new value, then return that to the parent
          // component using selectSearchValue prop
          onChange={(event: React.SyntheticEvent, newValue: SearchQuery[]) => {
            props.selectSearchValue(newValue[0]);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              className="rounded-md border-primary-dark border-2 w-full h-12 px-2 bg-white text-primary-dark placeholder-primary-dark font-bold"
              placeholder="Search section number, professor name, course number...."
              startAdornment={
                <InputAdornment position="start">
                  <Search className="fill-primary text-4xl" />
                </InputAdornment>
              }
            />
          )}
          defaultValue={[]}
        />
      </div>
    </>
  );
};

SplashPageSearchBar.defaultProps = {
  disabled: true,
};
