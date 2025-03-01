import { Rating as _Rating, styled } from '@mui/material';

// for star color for rating
const Rating = styled(_Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
  },
}));

export default Rating;
