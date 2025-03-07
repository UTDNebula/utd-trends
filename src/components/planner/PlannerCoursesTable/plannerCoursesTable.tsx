import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from '@mui/material';
import React from 'react';
import PlannerCard from './PlannerCard/plannerCard';
import Rating from '@/components/common/Rating/rating';

function LoadingRow() {
  return (
    <TableRow>
      <TableCell className="flex gap-1">
        <IconButton aria-label="expand row" size="medium" disabled>
          <KeyboardArrowIcon />
        </IconButton>
        <Checkbox disabled />
      </TableCell>
      <TableCell component="th" scope="row" className="w-full">
        <Typography className="w-full leading-tight text-lg">
          <Skeleton />
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="rounded"
          className="rounded-full px-5 py-2 min-w-16 block mx-auto"
        >
          <Typography className="text-base">A+</Typography>
        </Skeleton>
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="rounded" className="rounded-full mx-auto">
          <Rating sx={{ fontSize: 25 }} readOnly />
        </Skeleton>
      </TableCell>
    </TableRow>
  );
}

type PlannerCoursesTableProps = {
  prop?: string;
  courses?: {
    prefix: string;
    number: string;
    profFirst: string;
    profLast: string;
  }[];
};

const PlannerCoursesTable = (props: PlannerCoursesTableProps) => {
  console.log(props.courses ? 'courses exist' : "courses don't exist");
  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <Stack spacing={2}>
        {props.courses ? (
          props.courses.map((course, index) => {
            return (
              <>
                <PlannerCard
                  key={index}
                  prefix={course.prefix}
                  number={course.number}
                  profFirst={course.profFirst}
                  profLast={course.profLast}
                  numSections={4}
                />
              </>
            );
          })
        ) : (
          <div>empty</div>
        )}
      </Stack>
    </>
  );
};

export default PlannerCoursesTable;
