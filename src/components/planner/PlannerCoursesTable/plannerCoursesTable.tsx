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
} from '@mui/material';
import React from 'react';

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
};

const PlannerCoursesTable = ({ prop }: PlannerCoursesTableProps) => {
  console.log(prop ?? '');
  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="center">Grades</TableCell>
              <TableCell align="center">Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <LoadingRow key={index} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PlannerCoursesTable;
