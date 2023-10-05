import { useEffect, useState } from 'react';
import { SearchTermCard } from '../SearchTermCard/searchTermCard';
import Card from '@mui/material/Card';
import { CardContent } from '@mui/material';
import { SearchBar } from '../SearchBar/searchBar';
import React from 'react';
import { useRouter } from 'next/router';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';

type ExpandableSearchGridProps = {
  onChange: Function;
  setIncluded: Function;
  studentTotals: number[];
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const ExpandableSearchGrid = ({
  onChange,
  setIncluded,
  studentTotals,
}: ExpandableSearchGridProps) => {
  const [value, setValue] = useState<SearchQuery[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchQuery[]>([]);
  const [searchTermsInclude, setSearchTermsInclude] = useState<boolean[]>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  useEffect(() => {
    onChange(searchTerms);
  }, [onChange, searchTerms]);

  useEffect(() => {
    setIncluded(searchTermsInclude);
  }, [setIncluded, searchTermsInclude]);

  function addSearchTerm(newSearchTerm: SearchQuery) {
    if (newSearchTerm != null) {
      //console.log('adding ' + newSearchTerm + ' to the search terms.');
      setSearchTerms([...searchTerms, newSearchTerm]);
      setSearchTermsInclude([...searchTermsInclude, true]);
    }
  }

  function deleteSearchTerm(searchTermIndex: number) {
    //console.log('deleteSearchTerm called on ' + searchTermIndex);
    setSearchTerms(
      searchTerms
        .slice(0, searchTermIndex)
        .concat(searchTerms.slice(searchTermIndex + 1)),
    );
    setSearchTermsInclude(
      searchTermsInclude
        .slice(0, searchTermIndex)
        .concat(searchTermsInclude.slice(searchTermIndex + 1)),
    );
    setValue(
      value
        ?.slice(0, searchTermIndex)
        .concat(searchTerms.slice(searchTermIndex + 1)),
    );
  }

  function toggleSearchTerm(searchTermIndex: number) {
    let newSearchTermsInclude = [...searchTermsInclude];
    newSearchTermsInclude[searchTermIndex] =
      !newSearchTermsInclude[searchTermIndex];
    setSearchTermsInclude(newSearchTermsInclude);
  }

  useEffect(() => {
    if (searchTerms.length >= 3) {
      setSearchDisable(true);
    } else {
      setSearchDisable(false);
    }
  }, [searchTerms]);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      setSearchTerms(parseURIEncodedSearchTerms(router.query.searchTerms));
      setSearchTermsInclude(
        Array(URIEncodedSearchTermsLength(router.query.searchTerms)).fill(true),
      );
    }
  }, [router.isReady]);

  return (
    <div className="w-full min-h-[72px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: SearchQuery, index: number) => (
        <SearchTermCard
          primaryText={searchQueryLabel(option)}
          secondaryText={studentTotalFormatter(studentTotals[index])}
          key={index}
          index={index}
          legendColor={searchQueryColors[index]}
          onCloseButtonClicked={deleteSearchTerm}
          onToggleButtonClicked={toggleSearchTerm}
          visible={searchTermsInclude[index]}
        />
      ))}
      {searchTerms.length < 3 ? (
        <Card className="bg-primary-light rounded-none">
          <CardContent className="flex flex-col justify-center items-start p-3">
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

function studentTotalFormatter(total: number) {
  if (total === -1) {
    return 'Loading...';
  }
  return total.toLocaleString('en-US') + ' grades';
}

function URIEncodedSearchTermsLength(
  encodedSearchTerms: string | string[] | undefined,
): number {
  if (typeof encodedSearchTerms === 'undefined') {
    return 0;
  } else if (typeof encodedSearchTerms === 'string') {
    return encodedSearchTerms.split(',').length;
  } else {
    return encodedSearchTerms.length;
  }
}

function parseURIEncodedSearchTerms(
  encodedSearchTerms: string | string[] | undefined,
): SearchQuery[] {
  if (typeof encodedSearchTerms === 'undefined') {
    return [];
  } else if (typeof encodedSearchTerms === 'string') {
    return encodedSearchTerms
      .split(',')
      .map((term) => parseURIEncodedSearchTerm(term));
  } else {
    return encodedSearchTerms.map((term) => parseURIEncodedSearchTerm(term));
  }
}

function parseURIEncodedSearchTerm(encodedSearchTerm: string): SearchQuery {
  let encodedSearchTermParts = encodedSearchTerm.split(' ');
  // Does it start with prefix
  if (/^([A-Z]{2,4})$/.test(encodedSearchTermParts[0])) {
    // If it is just the prefix, return that
    if (encodedSearchTermParts.length == 1) {
      return { prefix: encodedSearchTermParts[0] };
    }
    // Is the second part a course number only
    if (/^([0-9A-Z]{4})$/.test(encodedSearchTermParts[1])) {
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: encodedSearchTermParts[1],
          professorName:
            encodedSearchTermParts[2] + ' ' + encodedSearchTermParts[3],
        };
      }
    }
    // Is the second part a course number and section
    else if (/^([0-9A-Z]{4}\.[0-9A-Z]{3})$/.test(encodedSearchTermParts[1])) {
      let courseNumberAndSection: string[] =
        encodedSearchTermParts[1].split('.');
      if (encodedSearchTermParts.length == 2) {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
        };
      } else {
        return {
          prefix: encodedSearchTermParts[0],
          number: courseNumberAndSection[0],
          sectionNumber: courseNumberAndSection[1],
          professorName:
            encodedSearchTermParts[2] + ' ' + encodedSearchTermParts[3],
        };
      }
    }
    // the second part is the start of the name
    else {
      return {
        prefix: encodedSearchTermParts[0],
        professorName:
          encodedSearchTermParts[1] + ' ' + encodedSearchTermParts[2],
      };
    }
  } else {
    return { professorName: encodedSearchTerm.trim() };
  }
}
