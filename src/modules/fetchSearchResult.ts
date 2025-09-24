import untypedCoursePrefixNumberTable from '@/data/course_prefix_number_table.json';
import {
  convertToCourseOnly,
  isCourseQuery,
  isProfessorQuery,
  searchQueryLabel,
  type SearchQuery,
  type SearchResult,
} from '@/types/SearchQuery';
import fetchGrades from './fetchGrades2';
import fetchRmp from './fetchRmp2';
import fetchSections from './fetchSections2';
const coursePrefixNumberTable = untypedCoursePrefixNumberTable as {
  [key: string]: string;
};
export async function fetchSearchResult(
  searchQuery: SearchQuery,
): Promise<SearchResult> {
  const gradesPromise = fetchGrades(searchQuery);
  const sectionsPromise = fetchSections(searchQuery);
  if (isProfessorQuery(searchQuery)) {
    const rmpPromise = fetchRmp(searchQuery);
    const [grades, rmp, sections] = await Promise.all([
      gradesPromise,
      rmpPromise,
      sectionsPromise,
    ]);
    if (isCourseQuery(searchQuery)) {
      return {
        type: 'combo',
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
  const [grades, sections] = await Promise.all([
    gradesPromise,
    sectionsPromise,
  ]);
  return {
    type: 'course',
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
