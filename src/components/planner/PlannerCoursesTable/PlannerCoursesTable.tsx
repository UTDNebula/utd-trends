import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import Rating from '@/components/common/Rating/Rating';
import { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import {
  type SearchQuery,
  searchQueryEqual,
} from '@/modules/SearchQuery/SearchQuery';
import { SectionsType } from '@/modules/SectionsType/SectionsType';

import PlannerCard from './PlannerCard/plannerCard';

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
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
};

const PlannerCoursesTable = (props: PlannerCoursesTableProps) => {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    setCourses(props.courses);
  }, []);
  console.log(courses);
  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        My Planner
      </Typography>
      <Stack spacing={2}>
        {props.courses ? (
          courses.map((course, index) => {
            const sectionKey = `${course.prefix} ${course.number} ${course.profFirst} ${course.profLast}`;
            const sectionData = props.sections[sectionKey];

            if (sectionData.state === 'done') {
              return (
                <>
                  <PlannerCard
                    key={index}
                    prefix={course.prefix}
                    number={course.number}
                    profFirst={course.profFirst}
                    profLast={course.profLast}
                    latestSections={sectionData.data.latest}
                    onBookmarkClick={() => {
                      props.removeFromPlanner(course);
                      setCourses((prevCourses) => {
                        return prevCourses.filter((prevCourse) => {
                          return (
                            JSON.stringify(prevCourse) !==
                            JSON.stringify(course)
                          );
                        });
                      });
                    }}
                  />
                </>
              );
            }
          })
        ) : (
          <div>empty</div>
        )}
      </Stack>
    </>
  );
};

export default PlannerCoursesTable;
