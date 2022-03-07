import * as React from 'react';
import Card from '@mui/material/Card';
import { Box, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

type SearchTermCardProps = {
  initialValue: string;
  index: number;
  onCloseButtonClicked: Function;
  color: string;
};

export const SearchTermCard = (props: SearchTermCardProps) => {
  function handleClick() {
    props.onCloseButtonClicked(props.initialValue);
  }

  return (
    <Card
      className="bg-secondary"
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
            backgroundColor: props.color,
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
        <IconButton aria-label="play/pause" onClick={handleClick}>
          <Close />
        </IconButton>
      </div>
    </Card>
  );
};
