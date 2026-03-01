import Compare from '@/components/compare/Compare/Compare';
import Carousel from '@/components/navigation/Carousel/Carousel';
import CourseOverview, {
  LoadingCourseOverview,
} from '@/components/overview/CourseOverview/CourseOverview';
import ProfessorOverview, {
  LoadingProfessorOverview,
} from '@/components/overview/ProfessorOverview/ProfessorOverview';
import { LoadingSearchResultsTable } from '@/components/search/SearchResultsTable/SearchResultsTable';
import fetchCourse from '@/modules/fetchCourse';
import fetchGrades from '@/modules/fetchGrades';
import fetchProfessor from '@/modules/fetchProfessor';
import fetchRmp from '@/modules/fetchRmp';
import { type SearchQuery, type SearchResult } from '@/types/SearchQuery';
import { Card } from '@mui/material';
import React, { Suspense } from 'react';
import ServerLeft from './ServerLeft';

interface LoadingRightProps {
  courses?: SearchQuery[];
  professors?: SearchQuery[];
  isMobile?: boolean;
}

export function LoadingRight(props: LoadingRightProps) {
  const names = [];
  const tabs = [];

  if (props.isMobile) {
    names.push('Search Results');
    tabs.push(<LoadingSearchResultsTable key="search-results" />);
  }

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

  if (!props.isMobile) {
    names.push('Compare');
    tabs.push(<Compare key="compare" />);
  }

  return (
    <Card>
      <Carousel key={names.join()} names={names} isMobile={props.isMobile}>
        {tabs}
      </Carousel>
    </Card>
  );
}

interface Props {
  courses: SearchQuery[];
  professors: SearchQuery[];
  searchResultsPromise: Promise<SearchResult[]>;
  isMobile?: boolean;
}

/**
 * Returns the right side (or full mobile view)
 */
export default async function Right(props: Props) {
  //Add RHS tabs, only add overview tab if one course/prof
  const names = [];
  const tabs = [];

  if (props.isMobile) {
    names.push('Search');
    tabs.push(
      <Suspense key="search-results" fallback={<LoadingSearchResultsTable />}>
        <ServerLeft
          courses={props.courses}
          professors={props.professors}
          searchResultsPromise={props.searchResultsPromise}
        />
      </Suspense>,
    );
  }

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
      <Card
        className={`${props.isMobile ? 'p-6' : 'bg-transparent bg-none shadow-none'}`}
      >
        <ProfessorOverview
          key="professor"
          professor={props.professors[0]}
          profData={profData}
          grades={grades}
          rmp={rmp}
        />
        ,
      </Card>,
    );
  }

  if (courseResults) {
    const [courseData, grades] = courseResults;
    names.push('Class');
    tabs.push(
      <Card
        className={`${props.isMobile ? 'p-6' : 'bg-transparent bg-none shadow-none'}`}
      >
        <CourseOverview
          key="course"
          course={props.courses[0]}
          courseData={courseData}
          grades={grades}
        />
      </Card>,
    );
  }

  if (!props.isMobile) {
    names.push('Compare');
    tabs.push(<Compare key="compare" />);
  }

  return (
    <Card
      className={`${props.isMobile ? 'bg-transparent bg-none shadow-none overflow-visible' : ''}`}
    >
      <Carousel key={names.join()} names={names} isMobile={props.isMobile}>
        {tabs}
      </Carousel>
    </Card>
  );
}
