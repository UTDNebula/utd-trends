import { Rating as _Rating, styled } from '@mui/material';

const Rating = styled(_Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.light,
  },
}));

export default Rating;
