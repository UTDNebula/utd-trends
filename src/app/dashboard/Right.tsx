import Compare from '@/components/compare/Compare/Compare';
import Carousel from '@/components/navigation/Carousel/Carousel';
import CourseOverview, {
  LoadingCourseOverview,
} from '@/components/overview/CourseOverview/CourseOverview';
import ProfessorOverview, {
  LoadingProfessorOverview,
} from '@/components/overview/ProfessorOverview/ProfessorOverview';
import fetchCourse from '@/modules/fetchCourse';
import fetchGrades from '@/modules/fetchGrades';
import fetchProfessor from '@/modules/fetchProfessor';
import fetchRmp from '@/modules/fetchRmp';
import { type SearchQuery, type SearchResult } from '@/types/SearchQuery';
import { Card } from '@mui/material';
import React from 'react';

interface LoadingRightProps {
  courses?: SearchQuery[];
  professors?: SearchQuery[];
}

export function LoadingRight(props: LoadingRightProps) {
  const names = [];
  const tabs = [];
  if (
    typeof props.courses !== 'undefined' &&
    typeof props.professors !== 'undefined' &&
    props.professors.length === 1
  ) {
    names.push('Professor');
    tabs.push(<LoadingProfessorOverview key="professor" />);
  }
  if (
    typeof props.courses === 'undefined' ||
    typeof props.professors === 'undefined' ||
    props.courses.length === 1
  ) {
    names.push('Class');
    tabs.push(<LoadingCourseOverview key="course" />);
  }
  // names.push('Compare');
  // tabs.push(<Compare key="compare" />);

  return (
    <Card>
      <Carousel names={names}>{tabs}</Carousel>
    </Card>
  );
}

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
  searchResultsPromise: Promise<SearchResult[]>;
}

/**
 * Returns the left side
 */
export default async function Right(props: Props) {
  //Add RHS tabs, only add overview tab if one course/prof
  const names = [];
  const tabs = [];

  const professorPromise =
    props.professors.length === 1
      ? Promise.all([
          fetchProfessor(props.professors[0]),
          fetchGrades(props.professors[0]),
          fetchRmp(props.professors[0]),
        ]).catch(() => null)
      : null;

  const coursePromise =
    props.courses.length === 1
      ? Promise.all([
          fetchCourse(props.courses[0]),
          fetchGrades(props.courses[0]),
        ]).catch(() => null)
      : null;

  const [professorResults, courseResults] = await Promise.all([
    professorPromise,
    coursePromise,
  ]);

  if (professorResults) {
    const [profData, grades, rmp] = professorResults;
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

  if (courseResults) {
    const [courseData, grades] = courseResults;
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
