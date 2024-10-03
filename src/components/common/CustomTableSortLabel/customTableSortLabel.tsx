import { TableSortLabel, styled, useMediaQuery } from '@mui/material';

function CustomTableSortLabel(props: unknown) {
  //Selected arrow color
  const sortArrowColor = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'white'
    : 'black';

  //Change arrow color for TableSortLabel
  const StyledTableSortLabel = styled(TableSortLabel)({
    '& .MuiTableSortLabel-icon': {
      opacity: 0.5, // Ensure the arrow is always visible
    },
    '&.Mui-active .MuiTableSortLabel-icon': {
      color: sortArrowColor, // Brighten the arrow
    },
  });

  return <StyledTableSortLabel {...props} />;
}

export default CustomTableSortLabel;
