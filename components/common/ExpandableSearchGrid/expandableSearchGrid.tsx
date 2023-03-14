import { useEffect, useState } from 'react';
import { SearchTermCard } from '../SearchTermCard/searchTermCard';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import { SearchBar } from '../SearchBar/searchBar';
import React from 'react';

type SearchQuery = {
  prefix?: string;
  number?: number;
  professorName?: string;
  sectionNumber?: string;
};

type ExpandableSearchGridProps = {
  onChange: Function;
  startingData: SearchQuery;
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const ExpandableSearchGrid = (props: ExpandableSearchGridProps) => {
  const [value, setValue] = useState<SearchQuery[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchQuery[]>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  useEffect(() => {
    props.onChange(searchTerms);
  }, [searchTerms]);

  useEffect(() => {
    if (Object.keys(props.startingData).length !== 0) {
      setSearchTerms([props.startingData]);
    }
  }, [props.startingData]);

  function addSearchTerm(newSearchTerm: SearchQuery) {
    if (newSearchTerm != null) {
      console.log('adding ' + newSearchTerm + ' to the search terms.');
      setSearchTerms([...searchTerms, newSearchTerm]);
    }
  }

  function deleteSearchTerm(searchTermIndex: number) {
    console.log('deleteSearchTerm called on ' + searchTermIndex);
    setSearchTerms(
      searchTerms
        .slice(0, searchTermIndex)
        .concat(searchTerms.slice(searchTermIndex + 1)),
    );
    setValue(
      value
        ?.slice(0, searchTermIndex)
        .concat(searchTerms.slice(searchTermIndex + 1)),
    );
  }

  useEffect(() => {
    if (searchTerms.length >= 3) {
      setSearchDisable(true);
    } else {
      setSearchDisable(false);
    }
  }, [searchTerms]);

  return (
    <div className="w-full min-h-[72px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: SearchQuery, index: number) => (
        <SearchTermCard
          primaryText={searchQueryLabel(option)}
          secondaryText={''}
          key={index}
          index={index}
          legendColor={colors[index]}
          onCloseButtonClicked={deleteSearchTerm}
        />
      ))}
      {searchTerms.length < 3 ? (
        <Card className="bg-primary-light" sx={{ borderRadius: 0 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 1.5,
              '&:last-child': {
                paddingBottom: 1.5,
              },
            }}
          >
            <SearchBar
              selectSearchValue={addSearchTerm}
              value={value}
              setValue={setValue}
              disabled={searchDisabled}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
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

const colors = ['#eb5757', '#2d9cdb', '#499F68'];
