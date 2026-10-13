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
export const othersSentinalValue = 'OTHERS';

export function displaySectionTypeName(id: string): string {
  const SectionTypesMap: Record<string, string> = {
    '0xx': 'Normal day lecture',
    '0Wx': 'Online class',
    '0Hx': 'Hybrid day class (online + face-to-face)',
    '0Lx': 'LLC-only section',
    '5Hx': 'Hybrid night class (online + face-to-face)',
    '1xx': 'Lab section (sciences)',
    '2xx': 'Discussion section (humanities)',
    '3xx': 'Problem section (maths)',
    '5xx': 'Night lecture (past 5 PM)',
    '6xx': 'Lab night section (past 7 PM)',
    '7xx': 'Exam section',
    HNx: 'Honors-only',
    HON: 'Honors-only',
    xUx: 'Summer Class',
    OTHERS: 'Others',
  };

  return SectionTypesMap[id] || id; // Default to ID if no mapping exists
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
  ].sort((a, b) => {
    // Keep "OTHERS" at end of array
    if (a === othersSentinalValue) return 1;
    if (b === othersSentinalValue) return -1;
    return a.localeCompare(b);
  });
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
    (chosenSectionTypes.includes(othersSentinalValue) &&
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
