import { Typography } from '@mui/material';
import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { GradesType } from '../../../pages/dashboard/index';

type CourseOverviewProps = {
  course: SearchQuery;
  grades: GradesType;
};

const CourseOverview = ({ course, grades }: CourseOverviewProps) => {
  return (
    <>
      <p>course</p>
      <p>{searchQueryLabel(course)}</p>
    </>
  );
};

export default CourseOverview;
