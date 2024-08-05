import React from 'react';

import SearchQuery from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import { CourseData } from '../../../pages/api/course';
import type { GradesType } from '../../../pages/dashboard/index';

type CourseOverviewProps = {
  course?: CourseData;
  courseLoading: 'loading' | 'done' | 'error';
  grades: GradesType;
  gradesLoading: 'loading' | 'done' | 'error';
};

const CourseOverview = ({
  course,
  courseLoading,
  grades,
  gradesLoading,
}: CourseOverviewProps) => {
  if (courseLoading === 'done' && course != null)
    return (
      <>
        <p>{course.subject_prefix + ' ' + course.course_number}</p>
        <p>{course.description}</p>
      </>
    );
  //@TODO: maybe remove the tab or prevent creation if loading
  else
    return (
      <>
        <p>Course information is not available</p>
      </>
    );
};

export default CourseOverview;
