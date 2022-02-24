import { SearchIcon } from './searchIcon';
import * as React from 'react';
import { withStyles } from '@mui/material';
import { SvgIcon } from '@mui/material';

/**
 * Props type used by the SearchBar component
*/
type SearchProps = {
  // setSearch: the setter function from the parent component to set the search value
  setSearch: Function;
};

/**
 * This component returns a custom search bar component that makes use of the Search Icon component
 * Sends the input value to the parent component on 'Enter' 
*/
export const SearchBar = (props: SearchProps) => {
  return (
    <>
      <div className=" text-primary m-auto w-11/12 -translate-y-1/2">
        <div className="translate-y-10 translate-x-4 w-8 h-8">
          <SearchIcon />
        </div>
        <input
          type="search"
          id="mainSearch"
          className="rounded-md border-primary-dark border-2 w-full h-12 pl-12 bg-white text-primary-dark placeholder-primary-dark font-bold"
          placeholder="Search section number, professor name, course number...."
          onKeyPress={(e) =>
            e.key === 'Enter' && props.setSearch(e.currentTarget.value)
          }
        />
      </div>
    </>
  );
};
