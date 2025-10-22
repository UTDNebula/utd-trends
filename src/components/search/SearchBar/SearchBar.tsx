'use client';

import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, {
  type Key,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import untyped_professor_to_alias from '@/data/professor_to_alias.json';
import {
  decodeSearchQueryLabel,
  isCourseQuery,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/types/SearchQuery';

const professor_to_alias = untyped_professor_to_alias as {
  [key: string]: string;
};

interface LoadingSearchBarProps {
  className?: string;
  input_className?: string;
}

export function LoadingSearchBar(props: LoadingSearchBarProps) {
  return (
    <div className={'flex items-center gap-2 ' + (props.className ?? '')}>
      <Autocomplete
        className="grow"
        options={[]}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              className={props.input_className}
              placeholder="ex. GOVT 2306"
            />
          );
        }}
      />
      <Button
        variant="contained"
        disableElevation
        size="large"
        className="self-stretch my-px px-4 shrink-0 normal-case text-cornflower-200 dark:text-cornflower-700"
      >
        Search
      </Button>
    </div>
  );
}

type SearchQueryWithTitle = SearchQuery & {
  title?: string;
  subtitle?: string;
};

/**
 * Props type used by the SearchBar component
 */
interface Props {
  manageQuery?: 'onSelect';
  onSelect?: (value: SearchQuery[]) => void;
  className?: string;
  input_className?: string;
  autoFocus?: boolean;
  isPending?: boolean;
}

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export default function SearchBar(props: Props) {
  const { courseNames, setCourseNames } = useSharedState();

  //for spinner after router.push
  const [isPending, startTransition] = useTransition();

  //what you can choose from
  const [options, setOptions] = useState<SearchQueryWithTitle[]>([]);
  //initial loading prop for first load
  const [loading, setLoading] = useState(false);
  const [openErrorTooltip, setErrorTooltip] = useState(false);

  //shortcut to loading course name results if a known substring has no normal results
  const [noResult, setNoResults] = useState<null | string>(null);

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
  const searchParams = useSearchParams();
  const searchTerms = searchParams.get('searchTerms');
  useEffect(() => {
    if (searchTerms != null) {
      const arrayParam = searchTerms;
      const array = Array.isArray(arrayParam)
        ? arrayParam
        : arrayParam.split(',');
      setValue(array.map((el) => decodeSearchQueryLabel(el)));
    }
  }, [searchTerms]); // useEffect is called every time the query changes

  // updateValue -> onSelect -> updateQueries - clicking enter on an autocomplete suggestion in TopMenu Searchbar
  // updateValue -> onSelect -> props.onSelect (custom function) - clicking enter on an autocomplete suggestion in home page SearchBar
  // params.inputProps.onKeyDown -> handleKeyDown -> onSelect -> updateQueries/props.onSelect - clicking enter in the SearchBar
  // Button onClick -> onSelect -> updateQueries/props.onSelect - Pressing the "Search" Button

  //change all values
  function updateValue(newValue: SearchQuery[]) {
    setValue(newValue);
    onSelect(newValue); // clicking enter to select a autocomplete suggestion triggers a new search (it also 'Enters' for the searchbar)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    if (options.length == 0 || loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (inputValue === '') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(value);
      return;
    }
  }

  //update parent and queries
  function onSelect(newValue: SearchQuery[]) {
    if (searchTerms == newValue.map((el) => searchQueryLabel(el)).join(','))
      // do not initiate a new search when the searchTerms haven't changed
      return;
    setErrorTooltip(!newValue.length);
    newValue.forEach((v) => {
      if (isCourseQuery(v)) {
        courseNames[searchQueryLabel(v)] =
          options.find((o) => o.prefix === v.prefix && o.number === v.number)
            ?.subtitle ?? courseNames[searchQueryLabel(v)];
      }
    });
    setCourseNames({ ...courseNames });
    if (typeof props.onSelect !== 'undefined') {
      props.onSelect(newValue);
    }
    if (newValue.length && props.manageQuery === 'onSelect') {
      updateQueries(newValue);
    }
  }

  const router = useRouter();
  const pathname = usePathname();

  //update url with what's in value
  async function updateQueries(newValue: SearchQuery[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue.length > 0) {
      params.set(
        'searchTerms',
        newValue.map((el) => searchQueryLabel(el)).join(','),
      );
    } else {
      params.delete('searchTerms');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  //fetch new options, add tags if valid
  function loadNewOptions(newInputValue: string) {
    if (noResult !== null && newInputValue.startsWith(noResult)) {
      loadNewCourseNameOptions(newInputValue);
      return;
    }
    setLoading(true);
    if (newInputValue.trim() === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=both',
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.data ?? data.message);
        }
        //remove currently chosen values
        const filtered: SearchQuery[] = data.data.filter(
          (item: SearchQuery) =>
            value.findIndex((el) => searchQueryEqual(el, item)) === -1,
        );
        //add to chosen values if only one option and space
        if (
          // if the returned options minus already selected values is 1, then this
          // means a space following should autocomplete the previous stuff to a chip
          filtered.length === 1 &&
          // if the next character the user typed was a space, then the chip should be autocompleted
          // this looks at quickInputValue because it is always the most recent state of the field's string input,
          // so requests that return later will still see that a space was typed after the text to be autocompleted,
          // so it should autocomplete then when this is realized
          quickInputValue.current.charAt(newInputValue.length) === ' '
        ) {
          // only add chip on space when it matches the full prof name
          if (
            (typeof filtered[0].profFirst === 'undefined' &&
              typeof filtered[0].profLast === 'undefined') ||
            searchQueryEqual(
              {
                profFirst: filtered[0].profFirst?.toLowerCase(),
                profLast: filtered[0].profLast?.toLowerCase(),
              },
              decodeSearchQueryLabel(
                quickInputValue.current.toLowerCase().trim(),
              ),
            )
          ) {
            addValue(filtered[0]);
            const rest = quickInputValue.current
              .slice(newInputValue.length)
              .trimStart();
            setInputValue(rest);
            loadNewOptions(rest.trimEnd());
          }
        } else if (quickInputValue.current === newInputValue) {
          //still valid options
          if (!filtered.length) {
            setNoResults(newInputValue);
            loadNewCourseNameOptions(newInputValue);
          }
          setOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }

  //fetch new course name options
  function loadNewCourseNameOptions(newInputValue: string) {
    fetch(
      '/api/courseNameAutocomplete?input=' + encodeURIComponent(newInputValue),
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.data ?? data.message);
        }
        const formatted = data.data.map(
          (item: { title: string; result: SearchQuery }) => ({
            ...item.result,
            title: item.title,
          }),
        );
        //remove currently chosen values
        const filtered = formatted.filter(
          (item: SearchQueryWithTitle) =>
            !value.some((el) => searchQueryEqual(el, item)),
        );
        if (quickInputValue.current === newInputValue) {
          //still valid options
          setOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }

  //add value
  function addValue(newValue: SearchQuery) {
    setValue((prev) => [...prev, newValue]);
  }

  useEffect(() => {
    fetch('/api/autocomplete?input=someSearchTerm');
  }, []);

  return (
    <div
      className={'flex items-center gap-2 ' + (props.className ?? '')}
      data-tutorial-id="search"
    >
      <Autocomplete
        multiple
        freeSolo
        loading={loading}
        //highlight first option to add with enter
        autoHighlight={true}
        clearOnBlur={false}
        className="grow"
        getOptionLabel={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          return searchQueryLabel(option);
        }}
        getOptionKey={(option) => {
          if (typeof option === 'string') {
            return option;
          }
          if ('title' in option) {
            return option.title + searchQueryLabel(option);
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
          if (newValue.some((el) => typeof el === 'string')) {
            return;
          }
          //remove from options
          if (newValue.length > value.length) {
            setOptions((prev) =>
              prev.filter(
                (item: SearchQueryWithTitle) =>
                  !searchQueryEqual(
                    newValue[newValue.length - 1] as SearchQuery,
                    item,
                  ),
              ),
            );
          }
          updateValue(newValue as SearchQuery[]);
        }}
        selectOnFocus={false}
        handleHomeEndKeys={false}
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
              placeholder="ex. GOVT 2306"
              autoFocus={props.autoFocus}
            />
          );
        }}
        //for handling spaces, when options are already loaded
        onInput={(event) => {
          const value = (event.target as HTMLInputElement).value;
          // if the last character in the new string is a space, check for autocomplete
          if (
            value[value.length - 1] === ' ' &&
            // but if the user is deleting text, don't try to autocomplete
            (event.nativeEvent as InputEvent).inputType === 'insertText'
          ) {
            // only add chip on space when it matches the full prof name
            if (
              value.length > 0 &&
              options.length === 1 &&
              ((typeof options[0].profFirst === 'undefined' &&
                typeof options[0].profLast === 'undefined') ||
                searchQueryEqual(
                  {
                    profFirst: options[0].profFirst?.toLowerCase(),
                    profLast: options[0].profLast?.toLowerCase(),
                  },
                  decodeSearchQueryLabel(value.toLowerCase().trim()),
                ))
            ) {
              event.preventDefault();
              event.stopPropagation();
              addValue(options[0]);
              setOptions([]);
              (event.target as HTMLInputElement).value = '';
            }
          }
        }}
        renderOption={(
          props: { key: Key },
          option: string | SearchQueryWithTitle,
          { inputValue },
        ) => {
          let text = '';
          let subtext;
          if (typeof option === 'string') {
            text = option;
          } else if (typeof option.title !== 'undefined') {
            text = option.title;
            subtext = searchQueryLabel(option);
          } else if (typeof option.subtitle !== 'undefined') {
            text = searchQueryLabel(option);
            subtext = option.subtitle;
          } else {
            text = searchQueryLabel(option);
            subtext = professor_to_alias[searchQueryLabel(option)] ?? '';
          }
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
          const subTextMatches = match(
            subtext ?? '',
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
          const subtextParts = subtext ? parse(subtext, subTextMatches) : [];
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              <div>
                <div>
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
                </div>
                {subtext && (
                  <Typography variant="caption">
                    {subtextParts.map((part, index) => (
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
                  </Typography>
                )}
              </div>
            </li>
          );
        }}
        renderValue={(value: readonly (string | SearchQuery)[], getItemProps) =>
          value.map((option: string | SearchQuery, index: number) => {
            const { key, ...itemProps } = getItemProps({ index });
            const optionString =
              typeof option === 'string' ? option : searchQueryLabel(option);
            return (
              <Tooltip key={key} title={courseNames[optionString]}>
                <Chip label={optionString} {...itemProps} />
              </Tooltip>
            );
          })
        }
      />
      <Tooltip
        title="Select a course or professor before searching"
        placement="top"
        open={openErrorTooltip}
        onOpen={() => setErrorTooltip(true)}
        onClose={() => setErrorTooltip(false)}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <Button
          variant="contained"
          disableElevation
          size="large"
          className={`self-stretch my-px px-4 shrink-0 normal-case relative ${
            value.length == 0
              ? 'text-cornflower-200 dark:text-cornflower-700'
              : ''
          }`} //darkens the text when no valid search terms are entered (pseudo-disables the search button)
          onClick={() => onSelect(value)}
        >
          <p className={isPending || props.isPending ? 'opacity-0' : ''}>
            Search
          </p>
          {(isPending || props.isPending) && (
            <CircularProgress
              color="inherit"
              className="absolute h-6 w-6 text-cornflower-50 dark:text-haiti"
            />
          )}
        </Button>
      </Tooltip>
    </div>
  );
}
