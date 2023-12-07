import { Typography } from '@mui/material';
import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { RelatedTermCard } from '../RelatedTermCard/relatedTermCard';

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
      <div className="p-4 rounded-none">
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
