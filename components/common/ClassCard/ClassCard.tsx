import { Card } from '@mui/material';
import React from 'react';

import { BarGraph } from '../../graph/BarGraph/BarGraph';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';

type ClassCardProps = {
  searchQuery: SearchQuery;
  graphProps: GraphProps;
};

export const ClassCard = (props: ClassCardProps) => {
  return (
    <Card className="p-4 m-4">
      <div>hi</div>
      <div className="h-80">
        <BarGraph {...props.graphProps} />
      </div>
    </Card>
  );
};

export default ClassCard;
