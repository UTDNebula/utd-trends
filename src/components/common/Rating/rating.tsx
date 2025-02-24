import { Rating as _Rating, styled } from '@mui/material';

// Purple star color for rating
const Rating = styled(_Rating)({
  '& .MuiRating-iconFilled': {
    color: '#e9d5fe', // Directly applying the hex color
  },
});

export default Rating;
