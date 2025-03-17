import { Rating as _Rating, styled } from '@mui/material';

// for star color for rating
const Rating = styled(_Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.mode === 'dark' 
      ? theme.palette.primary.light  // Lighter color in dark mode
      : theme.palette.primary.main,  // Normal color in light mode
  },
  '& .MuiRating-iconEmpty': {
    color: theme.palette.mode === 'dark'
      ? theme.palette.grey[700]      // Darker grey in dark mode
      : theme.palette.grey[300],     // Lighter grey in light mode
  }
}));

export default Rating;
