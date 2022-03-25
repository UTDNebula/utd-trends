import * as React from 'react';
import { SearchIcon } from './searchIcon';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';
import axios from 'axios';

/**
 * Props type used by the SearchBar component
 */
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  selectSearchValue: Function;
  value: Suggestion[] | undefined;
  setValue: Function;
  disabled?: boolean;
};

/**
 * Data types used by the options
 */
interface Components {
  subject:string;
  course:string;
  professor:string;
}
interface Suggestion {
  suggestion:string;
  components: Components;
}

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export const SplashPageSearchBar = (props: SearchProps) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly Suggestion[]>([]);
  const loading = open && options.length === 0;

  const [inputValue, setInputValue] = React.useState('');

  const fetch = React.useMemo(
    () =>
      throttle(
        async (
          request: { input: string },
          callback: (results?: readonly Suggestion[]) => void,
        ) => {
          console.log('"called" the api again');
          if(request.input != ""){
            let dat = await (await axios.get('http://45.79.48.79/suggestions/'+request.input)).data; //fetch to get JSON object containing results
            let fin:Suggestion[] = [];
            for(var key in dat){
              if(dat.hasOwnProperty(key)){
                fin.push(dat[key]);
              }
            }
            console.log(dat);
            console.log(fin);
            callback(fin);
          }
        },
        200,
      ),
    [],
  );

  React.useEffect(() => {
    let active = true;

    (async () => {
      fetch({ input: inputValue }, (results?: readonly Suggestion[]) => {
        if (active) {
          let newOptions: readonly Suggestion[] = [];

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      });

      if (active) {
        console.log('options updated');
        setOptions([...[]]);
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
          // Keeps already selected options from appearing in the options list
          filterSelectedOptions
          getOptionLabel={(option) => option.suggestion}
          options={options}
          loading={loading}
          value={props.value}
          onChange={(event: any, newValue: Suggestion[] | undefined, reason) => {
            // Removes ability to deselect options with delete key while focusing the input
            if (reason === 'removeOption') {
              return;
            }

            // Finds the newly selected option by finding difference between previous set and new set
            let difference: Suggestion[];
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

            // Returns the difference if there is one, otherwise null
            props.selectSearchValue(
              difference[0] ? difference[0] : null,
            );

            // Sets the new value
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
