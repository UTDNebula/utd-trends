import * as React from 'react';
import { SearchIcon } from '../../icons/SearchIcon/searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
// import { searchAutocomplete } from '../../autocomplete';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: Function;
  value: SearchQuery[];
  setValue: Function;
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
  const [controller, setController] = React.useState(new AbortController());
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (loading) {
      controller.abort();
    }
    setController(new AbortController());
    setLoading(true);
  }, [props.value, inputValue]);

  useEffect(() => {
    if (loading) {
      fetch('/api/autocomplete?input=' + inputValue, {
        signal: controller.signal,
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
          setOptions(data.output.concat(props.value));
        })
        .catch((error) => {
          if (error instanceof DOMException) {
            // ignore aborts
          } else {
            setLoading(false);
            console.log(error);
          }
        });
    }
  }, [controller, loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <div className="text-primary w-11/12 h-fit flex flex-row items-center">
        <div className="translate-x-12 w-8 h-8 text-primary">
          <SearchIcon />
        </div>
        <Autocomplete
          loading={loading}
          autoHighlight={true}
          multiple={true}
          disabled={props.disabled}
          className="w-full h-12 bg-primary-light outline-0 active:outline-0 focus:outline-0 font-sans"
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
            event: any,
            newValue: SearchQuery[] | undefined,
            reason,
          ) => {
            if (reason === 'removeOption') {
              return;
            }
            let difference: SearchQuery[];
            if (props.value !== undefined) {
              if (newValue !== undefined) {
                // @ts-ignore
                difference = newValue.filter((x) => !props.value.includes(x));
              } else {
                difference = [];
              }
            } else {
              if (newValue !== undefined) {
                difference = newValue;
              } else {
                difference = [];
              }
            }
            props.selectSearchValue(difference[0] ? difference[0] : null);
            props.setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <div
              ref={params.InputProps.ref}
              className="outline-0 active:outline-0 focus:outline-0 font-sans"
            >
              <input
                {...params.inputProps}
                type="search"
                id="mainSearch"
                className="outline-0 active:outline-0 focus:outline-0 w-full h-12 pl-16 bg-primary-light text-gray-600 placeholder-dark"
                placeholder="Search section number, professor name, course number...."
              />
            </div>
          )}
          renderOption={(props, option, { selected }) => (
            <li
              {...props}
              className="bg-white/25 active:bg-white/50 focus:bg-white/50 hover:bg-white/50 my-4 mx-8 font-sans"
            >
              <Box className="text-lg text-gray-600 pl-5 py-5">
                {searchQueryLabel(option)}
                <br />
                <span className="text-base text-gray-600">
                  {option.sectionNumber}
                </span>
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
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  if (query.sectionNumber !== undefined) {
    result += ' ' + query.sectionNumber;
  }
  return result.trim();
}
