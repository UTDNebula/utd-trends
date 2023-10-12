import { CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryColors from '../../../modules/searchQueryColors/searchQueryColors';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { SearchBar } from '../SearchBar/searchBar';
import { SearchTermCard } from '../SearchTermCard/searchTermCard';

type ExpandableSearchGridProps = {
  onChange: (searchTerms: SearchQuery[]) => void;
  studentTotals: number[];
  relatedQuery: SearchQuery | undefined;
  averageData: number[];
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const ExpandableSearchGrid = ({
  onChange,
  studentTotals,
  relatedQuery,
  averageData,
}: ExpandableSearchGridProps) => {
  const router = useRouter();

  const [searchTerms, setSearchTerms] = useState<SearchQuery[]>([]);
  const [searchDisabled, setSearchDisable] = useState<boolean>(false);

  useEffect(() => {
    onChange(searchTerms);
    if (router.isReady) {
      if (searchTerms.length > 0) {
        router.replace(
          {
            pathname: '/dashboard',
            query: { searchTerms: searchQueriesLabel(searchTerms) },
          },
          undefined,
          { shallow: true },
        );
      } else {
        router.replace('/dashboard', undefined, { shallow: true });
      }
    }
  }, [onChange, searchTerms]);

  function addSearchTerm(newSearchTerm: SearchQuery | null) {
    if (newSearchTerm != null) {
      //console.log('adding ' + newSearchTerm + ' to the search terms.');
      setSearchTerms([...searchTerms, newSearchTerm]);
    }
  }

  useEffect(() => {
    if (searchTerms.length < 3 && typeof relatedQuery !== 'undefined') {
      addSearchTerm(relatedQuery);
    }
  }, [relatedQuery]);

  function deleteSearchTerm(searchTermIndex: number) {
    //console.log('deleteSearchTerm called on ' + searchTermIndex);
    setSearchTerms(
      searchTerms
        .slice(0, searchTermIndex)
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

  useEffect(() => {
    if (router.isReady) {
      setSearchTerms(parseURIEncodedSearchTerms(router.query.searchTerms));
    }
  }, [router.isReady, router.query.searchTerms]);

  return (
    <div className="w-full min-h-[72px] grid grid-flow-row auto-cols-fr md:grid-flow-col justify-center">
      {searchTerms.map((option: SearchQuery, index: number) => (
        <SearchTermCard
          primaryText={searchQueryLabel(option)}
          secondaryText={secondaryTextFormatter(
            studentTotals[index],
            averageData[index],
          )}
          key={index}
          index={index}
          legendColor={searchQueryColors[index]}
          onCloseButtonClicked={deleteSearchTerm}
          loading={studentTotals[index] === -1 || averageData[index] === -1}
        />
      ))}
      {searchTerms.length < 3 ? (
        <Card className="bg-primary-light rounded-none" variant="outlined">
          <CardContent className="flex flex-col justify-center items-start p-3">
            <SearchBar
              selectSearchValue={addSearchTerm}
              searchTerms={searchTerms}
              disabled={searchDisabled}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

function secondaryTextFormatter(total: number, gpa: number) {
  return (
    total.toLocaleString('en-US') +
    ' grades | ' +
    Number(gpa).toFixed(2) +
    ' average GPA'
  );
}

function searchQueriesLabel(queries: SearchQuery[]): string {
  return queries.map((query) => searchQueryLabel(query)).join(',');
}

function parseURIEncodedSearchTerms(
  encodedSearchTerms: string | string[] | undefined,
): SearchQuery[] {
  if (encodedSearchTerms === undefined) {
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
  const encodedSearchTermParts = encodedSearchTerm.split(' ');
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
      const courseNumberAndSection: string[] =
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
