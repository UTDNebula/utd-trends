import { Card } from '@mui/material';
import React from 'react';

import GraphProps from '../../../modules/GraphProps/GraphProps';
import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

type ClassCardProps = {
  searchQuery: SearchQuery;
  graphProps: GraphProps;
};

export const ClassCard = (props: ClassCardProps) => {
  return (
    <Card className="p-4 m-4">
      <div>{searchQueryLabel(props.searchQuery)}</div>
      <div className="h-80">
        <BarGraph {...props.graphProps} />
      </div>
    </Card>
  );
};

export default ClassCard;
