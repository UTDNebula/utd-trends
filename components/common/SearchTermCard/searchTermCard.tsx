import { Close, Help, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';

/**
 * Props type used by the SearchTermCard component
 */
type SearchTermCardProps = {
  primaryText: string;
  secondaryText: string;
  includeTooltip: boolean;
  index: number;
  onCloseButtonClicked: (index: number) => void;
  onToggleButtonClicked: (index: number) => void;
  visible: boolean;
  legendColor: string;
  loading: boolean;
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
        <div>
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {props.primaryText}
          </Typography>
          <span className="block text-sm text-gray-500 dark:text-gray-300 inline">
            {props.loading ? 'Loading...' : props.secondaryText}
          </span>
          {!props.loading && props.includeTooltip && (
            <Tooltip title="Avergae GPA excludes dropped grades" arrow>
              <Help className="inline fill-gray-500 dark:fill-gray-300 text-base ml-0.5 mb-0.5" />
            </Tooltip>
          )}
        </div>
      </div>
      <div className="float-right">
        <Tooltip title="Remove query">
          <IconButton aria-label="remove query" onClick={handleCloseClick}>
            <Close />
          </IconButton>
        </Tooltip>
      </div>
    </Card>
  );
};
