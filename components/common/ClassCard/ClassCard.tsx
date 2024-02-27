import { Box,Card } from '@mui/material';
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
      <Box className="bg-gray-800 p-4 ml-5 mr-1">
        <div className="text-left inline-block m-0 w-1/3 pl-5">
          <h1>Overall</h1>
          <h1 className="text-2xl">4.5</h1>
        </div>

        <div className="text-Sleft inline-block m-0  w-1/3 pl-5">
          <h1>Grading</h1>
          <h1 className="text-2xl">4.5</h1>
        </div>

        <div className="text-left inline-block m-0  w-1/3 pl-5">
          <h1>Most frequent grade</h1>
          <h1 className="text-2xl">4.5</h1>
        </div>
      </Box>
    </Card>
  );
};

export default ClassCard;
