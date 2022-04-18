import * as React from 'react';
import { SearchIcon } from '../../icons/SearchIcon/searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';
import topFilms from '../../../data/autocomplete_dummy_data.json';

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
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
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
      <div className="text-primary m-auto w-11/12 -translate-y-1/2">
        <div className="translate-y-10 translate-x-4 w-8 h-8 text-primary-light">
          <SearchIcon />
        </div>
        <Autocomplete
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
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                type="search"
                id="mainSearch"
                className="rounded-md border-primary-dark border-2 w-full h-12 pl-12 bg-white text-primary-dark placeholder-primary-dark font-bold"
                placeholder="Search section number, professor name, course number...."
              />
            </div>
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
