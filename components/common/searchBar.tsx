import * as React from 'react';
import { SearchIcon } from './searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import { throttle } from 'lodash';
import topFilms from '../../data/autocomplete_dummy_data.json';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  setSearch: Function;
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

  const [value, setValue] = React.useState<Film | null>(null);
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

          if (value) {
            newOptions = [value];
          }

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
  }, [value, inputValue, fetch]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <>
      <div className=" text-primary m-auto w-11/12 -translate-y-1/2">
        <div className="translate-y-10 translate-x-4 w-8 h-8">
          <SearchIcon />
        </div>
        <Autocomplete
          className="w-full h-12 text-primary-dark placeholder-primary-dark font-bold"
          sx={{
            display: 'inline-block',
            '& input': {},
          }}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={(option, value) => option.title === value.title}
          getOptionLabel={(option) => option.title}
          options={options}
          loading={loading}
          value={value}
          onChange={(event: any, newValue: Film | null) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                type="search"
                id="mainSearch"
                className="rounded-md border-primary-dark border-2 w-full h-12 pl-12 bg-white text-primary-dark placeholder-primary-dark font-bold"
                placeholder="Search section number, professor name, course number...."
                onKeyPress={(e) =>
                  e.key === 'Enter' && props.setSearch(e.currentTarget.value)
                }
              />
            </div>
          )}
        />
      </div>
    </>
  );
};
