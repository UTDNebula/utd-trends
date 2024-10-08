import {
  styled,
  TableSortLabel as _TableSortLabel,
  TableSortLabelProps,
  useMediaQuery,
} from '@mui/material';
import React from 'react';

function TableSortLabel(props: TableSortLabelProps) {
  //Selected arrow color
  const sortArrowColor = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'white'
    : 'black';

  //Change arrow color for TableSortLabel
  const StyledTableSortLabel = styled(_TableSortLabel)({
    '& .MuiTableSortLabel-icon': {
      opacity: 0.5, // Ensure the arrow is always visible
    },
    '&.Mui-active .MuiTableSortLabel-icon': {
      color: sortArrowColor, // Brighten the arrow
    },
  });

  return <StyledTableSortLabel {...props} />;
}

export default TableSortLabel;
