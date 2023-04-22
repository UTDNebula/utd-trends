import * as React from 'react';
import Card from '@mui/material/Card';
import { IconButton, Typography } from '@mui/material';
import { AddCircle } from '@mui/icons-material';

/**
 * Props type used by the SearchTermCard component
 */
type RelatedTermCardProps = {
  primaryText: string;
  index: number;
  onAddButtonClicked: Function;
};

/**
 * This component returns a custom Card that shows the search term and a colored circle
 * next to it representing the corresponding data's color
 *
 */
export const RelatedTermCard = (props: RelatedTermCardProps) => {
  function handleAddClick() {
    props.onAddButtonClicked(props.index);
  }

  return (
    <Card
      className="bg-primary-light p-2 flex flex-row justify-between items-center rounded-none"
      variant="outlined"
    >
      <div className="float-left flex align-middle place-items-center">
        <Typography className="leading-tight text-lg text-gray-600">
          {/* dark:text-gray-200*/}
          {props.primaryText}
        </Typography>
      </div>
      <div className="float-right">
        <IconButton aria-label="add query" onClick={handleAddClick}>
          <AddCircle />
        </IconButton>
      </div>
    </Card>
  );
};
