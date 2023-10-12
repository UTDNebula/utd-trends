import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import React, { useState } from 'react';

/**
 * Props type used by the SearchTermCard component
 */
type SearchTermCardProps = {
  primaryText: string;
  secondaryText: string;
  index: number;
  onCloseButtonClicked: (index: number) => void;
  onToggleButtonClicked: (index: number) => void;
  visible: boolean;
  legendColor: string;
};

/**
 * This component returns a custom Card that shows the search term and a colored circle
 * next to it representing the corresponding data's color
 *
 */
export const SearchTermCard = (props: SearchTermCardProps) => {
  function handleToggleClick() {
    props.onToggleButtonClicked(props.index);
  }

  function handleCloseClick() {
    props.onCloseButtonClicked(props.index);
  }

  return (
    <Card className="bg-primary-light p-2 flex flex-row justify-between items-center rounded-none group">
      <div className="float-left flex align-middle place-items-center">
        <Box
          className={
            'rounded-full w-fit h-fit float-left mr-2 ml-2' +
            (props.visible ? '' : ' brightness-90')
          }
          sx={{
            backgroundColor: props.legendColor,
          }}
        >
          <Tooltip
            title={props.visible ? 'Turn off visibility' : 'Turn on visibility'}
          >
            <IconButton
              aria-label="toggle visibility"
              onClick={handleToggleClick}
            >
              {props.visible ? (
                <Visibility className="fill-light" />
              ) : (
                <VisibilityOff className="fill-light" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
          {props.primaryText}
          <span className="block text-sm text-gray-500 dark:text-gray-300">
            {props.secondaryText}
          </span>
        </Typography>
      </div>
      <div className="float-right">
        <IconButton aria-label="play/pause" onClick={handleCloseClick}>
          <Close />
        </IconButton>
      </div>
    </Card>
  );
};
