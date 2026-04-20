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

/** A comparator function used when sorting semesters by name. Negative if semester `a` is older than `b`, positive if newer, zero if equal. */
export function compareSemesters(a: string, b: string): number {
  const yearA = parseInt(a.slice(0, 2), 10);
  const yearB = parseInt(b.slice(0, 2), 10);
  if (yearA !== yearB) return yearA - yearB;
  const sa = 'SUF'.indexOf(a[2]);
  const sb = 'SUF'.indexOf(b[2]);
  if (sa === -1 || sb === -1) return a.slice(2).localeCompare(b.slice(2));
  return sa - sb;
}

/** Calendar semester id for "today" (Spring Jan–May, Summer Jun–Aug, Fall Sep–Dec). */
export function getCurrentSemester(): string {
  const today = new Date();
  const year = today.getFullYear() % 100;
  const month = today.getMonth();
  const semester = month < 5 ? 'S' : month < 8 ? 'U' : 'F';
  return `${year}${semester}`;
}

/** Semesters in `available` that fall in the inclusive window between `current` and `latest`. If `latest` is empty, keeps terms >= `current`.*/
export function getInWindowSemesters(
  available: string[],
  current: string,
  latest: string,
): string[] {
  if (available.length === 0) return [];
  if (!latest) {
    return available
      .filter((sem) => compareSemesters(sem, current) >= 0)
      .reverse();
  }
  const low = compareSemesters(current, latest) <= 0 ? current : latest;
  const high = compareSemesters(current, latest) <= 0 ? latest : current;
  return available
    .filter(
      (sem) =>
        compareSemesters(sem, low) >= 0 && compareSemesters(high, sem) >= 0,
    )
    .reverse();
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

export function getLatestSyllabusSection(searchResult: SearchResult) {
  const sections = searchResult.sections.filter(
    (s) => !!s.syllabus_uri && !!s.academic_session?.start_date,
  );
  if (sections.length === 0) return null;
  return sections.reduce((a, b) =>
    new Date(a.academic_session.start_date).getTime() >
      new Date(b.academic_session.start_date).getTime() || b == null
      ? a
      : b,
  );
}
