import { Card } from '@mui/material';
import React from 'react';

import Compare from '@/components/compare/Compare/Compare';
import Carousel from '@/components/navigation/Carousel/Carousel';
import CourseOverview from '@/components/overview/CourseOverview/CourseOverview';
import ProfessorOverview, {
  LoadingProfessorOverview,
} from '@/components/overview/ProfessorOverview/ProfessorOverview';
import fetchCourse from '@/modules/fetchCourse';
import fetchGrades from '@/modules/fetchGrades';
import fetchProfessor from '@/modules/fetchProfessor';
import fetchRmp from '@/modules/fetchRmp';
import { type SearchQuery } from '@/types/SearchQuery';

export function LoadingRight() {
  const names = ['Professor', 'Compare'];
  const tabs = [
    <LoadingProfessorOverview key="professor" />,
    <Compare key="compare" />,
  ];

  return (
    <Card>
      <Carousel names={names}>{tabs}</Carousel>
    </Card>
  );
}

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
}

/**
 * Returns the left side
 */
export default async function Right(props: Props) {
  //Add RHS tabs, only add overview tab if one course/prof
  const names = [];
  const tabs = [];
  if (props.professors.length === 1) {
    const [profData, grades, rmp] = await Promise.all([
      fetchProfessor(props.professors[0]),
      fetchGrades(props.professors[0]),
      fetchRmp(props.professors[0]),
    ]);
    names.push('Professor');
    tabs.push(
      <ProfessorOverview
        key="professor"
        professor={props.professors[0]}
        profData={profData}
        grades={grades}
        rmp={rmp}
      />,
    );
  }
  if (props.courses.length === 1) {
    const [courseData, grades] = await Promise.all([
      fetchCourse(props.courses[0]),
      fetchGrades(props.courses[0]),
    ]);
    names.push('Class');
    tabs.push(
      <CourseOverview
        key="course"
        course={props.courses[0]}
        courseData={courseData}
        grades={grades}
      />,
    );
  }
  names.push('Compare');
  tabs.push(<Compare key="compare" />);

  return (
    <Card>
      <Carousel names={names}>{tabs}</Carousel>
    </Card>
  );
}
