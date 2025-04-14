import { Rating, styled } from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';

// for star color for rating
const NewRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.vars.palette.primary.main,
  },
}));

export default NewRating;
