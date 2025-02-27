import { Rating as _Rating, styled } from '@mui/material';

const Rating = styled(_Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.mode === 'light' 
      ? theme.palette.primary.main // Use primary.main in light mode
      : theme.palette.primary.light, // Use primary.light in dark mode
  },
}));


export default Rating;
