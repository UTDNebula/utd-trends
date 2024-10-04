import { Rating as _Rating, styled } from '@mui/material';

// for star color for rating
const Rating = styled(_Rating)({
  '& .MuiRating-iconFilled': {
    color: '#5D3FD3',
    stroke: '#5D3FD3',
    strokeWidth: 0.3,
  },
  '& .MuiRating-iconEmpty': {
    stroke: '#5D3FD3',
    strokeWidth: 0.1,
  },
});

export default Rating;
