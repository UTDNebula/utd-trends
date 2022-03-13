import * as React from 'react';
import { SearchIcon } from './searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';
import topFilms from '../../data/autocomplete_dummy_data.json';
import Popper from '@mui/material/Popper';
import { Box, Paper } from '@mui/material';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: Function;
  value: Film[] | undefined;
  setValue: Function;
  disabled?: boolean;
};

interface Film {
  title: string;
  year: number;
}

/**
 * This component returns a custom search bar component that makes use of the Search Icon component
 * Sends the input value to the parent component on 'Enter'
 */
export const SearchBar = (props: SearchProps) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly Film[]>([]);
  const loading = open && options.length === 0;

  const [inputValue, setInputValue] = React.useState('');

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: readonly Film[]) => void,
        ) => {
          console.log('"called" the api again');
        },
        2000,
      ),
    [],
  );

  React.useEffect(() => {
    let active = true;

    (async () => {
      fetch({ input: inputValue }, (results?: readonly Film[]) => {
        if (active) {
          let newOptions: readonly Film[] = [];

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      });

      if (active) {
        console.log('options updated');
        setOptions([...topFilms]);
      }
    })();

    return () => {
      active = false;
    };
  }, [props.value, inputValue, fetch]);

  React.useEffect(() => {
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
          getOptionLabel={(option) => option.title}
          options={options}
          loading={loading}
          value={props.value}
          onChange={(event: any, newValue: Film[] | undefined) => {
            let intersection: Film[];
            if (props.value !== undefined) {
              if (newValue !== undefined) {
                // @ts-ignore
                intersection = newValue.filter((x) => !props.value.includes(x));
              } else {
                intersection = [];
              }
            } else {
              if (newValue !== undefined) {
                intersection = newValue;
              } else {
                intersection = [];
              }
            }
            props.selectSearchValue(
              intersection[0] ? intersection[0].title : '',
            );
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
            <li {...props} className="bg-white/25 my-4 mx-8 font-sans">
              <Box className="text-lg text-gray-600">
                {option.title}
                <br />
                <span className="text-base text-gray-600">{option.year}</span>
              </Box>
            </li>
          )}
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
