import type { SearchResult } from '@/types/SearchQuery';

const typeRegexes: Record<string, RegExp> = {
  '0xx': /0[0-9][0-9]/,
  '0Wx': /0W[0-9]/,
  '0Hx': /0H[0-9]/,
  '0Lx': /0L[0-9]/,
  '5Hx': /5H[0-9]/,
  '1xx': /1[0-9][0-9]/,
  '2xx': /2[0-9][0-9]/,
  '3xx': /3[0-9][0-9]/,
  '5xx': /5[0-9][0-9]/,
  '6xx': /6[0-9][0-9]/,
  '7xx': /7[0-9][0-9]/,
  HNx: /HN[0-9]/,
  HON: /HON/,
  xUx: /[0-9]U[0-9]/,
  OTHERS: /.*/,
};
const others = 'OTHERS';

/** A comparator function used when sorting semesters by name. Returns -1 if semester 'a' is more older than semester 'b'. */
export function compareSemesters(a: string, b: string) {
  const x = a.substring(0, 2).localeCompare(b.substring(0, 2));
  if (x == 0) {
    const a_char = a[2];
    const b_char = b[2];
    // a_char and b_char cannot both be the same semester because x == 0
    if (a_char == 'S') return -1;
    if (a_char == 'U' && b_char == 'S') return 1;
    if (a_char == 'U' && b_char == 'F') return -1;
    if (a_char == 'F') return 1;
    return 0;
  } else return x;
}

export function displaySemesterName(id: string, yearFirst = true) {
  if (yearFirst)
    return (
      '20' +
      id.slice(0, 2) +
      ' ' +
      { U: 'Summer', F: 'Fall', S: 'Spring' }[id.slice(2)]
    );
  else
    return (
      { U: 'Summer', F: 'Fall', S: 'Spring' }[id.slice(2)] +
      ' ' +
      '20' +
      id.slice(0, 2)
    );
}

export function getSemestersFromSearchResults(searchResults: SearchResult[]) {
  return [
    ...new Set(searchResults.flatMap((r) => r.grades.map((g) => g._id))),
  ].sort((a, b) => compareSemesters(b, a));
}
export function getSemestersFromSearchResult(searchResult: SearchResult) {
  return [...new Set(searchResult.grades.map((g) => g._id))].sort((a, b) =>
    compareSemesters(b, a),
  );
}
export function getSectionTypesFromSearchResults(
  searchResults: SearchResult[],
) {
  return [
    ...new Set(
      searchResults.flatMap((r) =>
        r.grades.flatMap((g) => g.data.map((sectionData) => sectionData.type)),
      ),
    ),
  ].sort();
}
export function getSectionTypesFromSearchResult(searchResult: SearchResult) {
  return [
    ...new Set(
      searchResult.grades.map((g) =>
        g.data.map((sectionData) => sectionData.type),
      ),
    ),
  ].sort();
}

export function matchSectionTypesFromSectionNumber(
  sectionNumber: string,
  chosenSectionTypes: string[],
): boolean {
  const matchesChosenSectionType = chosenSectionTypes.some(
    (secType) =>
      secType in typeRegexes && typeRegexes[secType].test(sectionNumber),
  );
  return (
    matchesChosenSectionType ||
    (chosenSectionTypes.includes(others) &&
      !matchSectionTypesFromSectionNumber(
        sectionNumber,
        Object.keys(typeRegexes),
      ))
  );
}
