import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import type { GradesType } from '../../../pages/dashboard/index';

type CompareProps = {
  courses: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
  gradesLoading: { [key: string]: 'loading' | 'done' | 'error' };
  rmpLoading: { [key: string]: 'loading' | 'done' | 'error' };
};

const Compare = ({
  courses,
  grades,
  rmp,
  gradesLoading,
  rmpLoading,
}: CompareProps) => {
  console.log(courses, grades, rmp, gradesLoading, rmpLoading);
  return (
    <>
      <p>compare</p>
      {courses.map((course) => (
        <p key={searchQueryLabel(course)}>{searchQueryLabel(course)}</p>
      ))}
    </>
  );
};

export default Compare;
