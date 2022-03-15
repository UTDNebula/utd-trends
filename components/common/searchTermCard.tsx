import * as React from 'react';
import Card from '@mui/material/Card';
import { Box, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * Props type used by the SearchTermCard component
 */
type SearchTermCardProps = {
  initialValue: string;
  index: number;
  onCloseButtonClicked: Function;
  legendColor: string;
};

/**
 * This component returns a custom Card that shows the search term and a colored circle
 * next to it representing the corresponding data's color
 *
 */
export const SearchTermCard = (props: SearchTermCardProps) => {
  function handleCloseClick() {
    props.onCloseButtonClicked(props.initialValue);
  }

  return (
    <Card
      className="bg-primary-light"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 0,
      }}
    >
      <div className="float-left flex align-middle place-items-center">
        <Box
          sx={{
            backgroundColor: props.legendColor,
            borderRadius: 100,
            width: '20px',
            height: '20px',
            float: 'left',
            marginRight: '8px',
            marginLeft: '8px',
          }}
        />
        <Typography component="div" variant="h5" sx={{ float: 'right' }}>
          {props.initialValue}
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
