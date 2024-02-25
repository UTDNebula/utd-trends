import React from 'react';
import SearchQuery from '../../modules/SearchQuery/SearchQuery';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

type ClassCardProps = {
  searchQuery: SearchQuery;
  graphProps: GraphProps;
};

export const ClassCard = (props: ClassCardProps) => {
  return (
    <>
      <div>hi</div>
      <BarGraph {...props.graphProps} />
    </>
  );
};

export default ClassCard;
