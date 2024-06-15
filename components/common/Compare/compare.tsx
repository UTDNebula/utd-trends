import { Typography } from '@mui/material';
import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
};

const Compare = ({ courses }: CompareProps) => {
  console.log(courses);
  return (
    <Typography className="leading-tight">
      compare
      {courses.map((course) => (
        <div key={searchQueryLabel(course)}>{searchQueryLabel(course)}</div>
      ))}
    </Typography>
  );
};

export default Compare;
