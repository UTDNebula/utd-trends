import { Close, Help } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import * as React from 'react';

/**
 * Props type used by the SearchTermCard component
 */
type SearchTermCardProps = {
  primaryText: string;
  secondaryText: string;
  index: number;
  onCloseButtonClicked: (index: number) => void;
  legendColor: string;
  loading: boolean;
};

/**
 * This component returns a custom Card that shows the search term and a colored circle
 * next to it representing the corresponding data's color
 *
 */
export const SearchTermCard = (props: SearchTermCardProps) => {
  function handleCloseClick() {
    props.onCloseButtonClicked(props.index);
  }

  return (
    <Card className="bg-primary-light p-2 flex flex-row justify-between items-center rounded-none">
      <div className="float-left flex align-middle place-items-center">
        <Box
          className="rounded-full w-5 h-5 float-left mr-2 ml-2"
          sx={{
            backgroundColor: props.legendColor,
          }}
        />
        <div>
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {props.primaryText}
          </Typography>
          <span className="block text-sm text-gray-500 dark:text-gray-300 inline">
            {props.loading ? 'Loading...' : props.secondaryText}
          </span>
          {props.loading ? null : (
            <Tooltip title="Avergae GPA excludes dropped grades" arrow>
              <Help className="inline fill-primary text-base ml-0.5 mb-0.5" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="float-right">
        <IconButton aria-label="play/pause" onClick={handleCloseClick}>
          <Close />
        </IconButton>
      </div>
    </Card>
  );
};
