import { styled, TableSortLabel } from '@mui/material';

//Change arrow color for TableSortLabel
const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    opacity: 0.5, // Ensure the arrow is always visible
  },
  '&.Mui-active .MuiTableSortLabel-icon': {
    color: theme.palette.mode === 'dark' 
      ? 'var(--mui-palette-text-primary)' 
      : 'var(--mui-palette-text-primary)', // Color for both light and dark modes
  },
}));

export default StyledTableSortLabel;
