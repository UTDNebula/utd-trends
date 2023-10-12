import { Typography } from '@mui/material';
import React from 'react';

import { RelatedTermCard } from '../RelatedTermCard/relatedTermCard';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

type RelatedClassesProps = {
  displayData: SearchQuery[];
  addNew: (query: SearchQuery) => void;
  disabled: boolean;
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const RelatedClasses = ({
  displayData,
  addNew,
  disabled,
}: RelatedClassesProps) => {
  function addSearchTerm(index: number) {
    addNew(displayData[index]);
  }

  return (
    <div className="grid grid-flow-column auto-cols-fr justify-center">
      <div className="bg-white p-4 rounded-none">
        <Typography className="leading-tight text-lg text-dark">
          Related Queries
        </Typography>
      </div>
      {displayData.map((option: SearchQuery, index: number) => (
        <RelatedTermCard
          primaryText={searchQueryLabel(option)}
          key={index}
          index={index}
          onAddButtonClicked={addSearchTerm}
          disabled={disabled}
        />
      ))}
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
  if (query.sectionNumber !== undefined) {
    result += '.' + query.sectionNumber;
  }
  if (query.professorName !== undefined) {
    result += ' ' + query.professorName;
  }
  return result.trim();
}
