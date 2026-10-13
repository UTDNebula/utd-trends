import untypedCoursePrefixNumberTable from '@/data/course_prefix_number_table.json';
import {
  convertToCourseOnly,
  isCourseQuery,
  isProfessorQuery,
  searchQueryLabel,
  type SearchQuery,
  type SearchResult,
} from '@/types/SearchQuery';
import fetchCourse from './fetchCourse';
import fetchGrades from './fetchGrades';
import fetchRmp from './fetchRmp';
import fetchSections from './fetchSections';

const coursePrefixNumberTable = untypedCoursePrefixNumberTable as {
  [key: string]: string;
};
export async function fetchSearchResult(
  searchQuery: SearchQuery,
): Promise<SearchResult> {
  const gradesPromise = fetchGrades(searchQuery);
  const sectionsPromise = fetchSections(searchQuery);
  const coursePromise = isCourseQuery(searchQuery)
    ? fetchCourse(convertToCourseOnly(searchQuery))
    : Promise.resolve(undefined);
  if (isProfessorQuery(searchQuery)) {
    const rmpPromise = fetchRmp(searchQuery);
    const [grades, rmp, sections, course] = await Promise.all([
      gradesPromise,
      rmpPromise,
      sectionsPromise,
      coursePromise,
    ]);
    if (isCourseQuery(searchQuery)) {
      return {
        type: 'combo',
        isNew: course?.message === 'success' && course.data.isNew,
        grades: grades,
        RMP: rmp,
        sections: sections,
        searchQuery: searchQuery,
        courseName:
          coursePrefixNumberTable[
            searchQueryLabel(convertToCourseOnly(searchQuery))
          ],
      };
    }
    return {
      type: 'professor',
      grades: grades,
      RMP: rmp,
      sections: sections,
      searchQuery: searchQuery,
    };
  }
  if (!isCourseQuery(searchQuery)) {
    throw new Error('Invalid query');
  }
  const [grades, sections, course] = await Promise.all([
    gradesPromise,
    sectionsPromise,
    coursePromise,
  ]);
  return {
    type: 'course',
    isNew: course?.message === 'success' && course.data.isNew,
    grades: grades,
    searchQuery: searchQuery,
    sections: sections,
    courseName:
      coursePrefixNumberTable[
        searchQueryLabel(convertToCourseOnly(searchQuery))
      ],
  };
}

// gets all searchresults and throws out the errors
export async function fetchSearchResults(searchQueries: SearchQuery[]) {
  const SettledsearchResults = await Promise.allSettled(
    searchQueries.map(fetchSearchResult),
  );
  const searchResults = SettledsearchResults.filter(
    (p) => p.status === 'fulfilled',
  ).map((p) => {
    return p.value;
  });
  return searchResults;
}
