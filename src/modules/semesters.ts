import type { SearchResult } from '@/types/SearchQuery';

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

/**
 * Returns long-semesters (i.e. not summer semesters) offered recently. By default, returns long-semesters from the last 2 years
 * @param {string[]} available Array of available semesters
 * @param {number} [maximumNumber=4] Maximum number of recent semesters to return (default 4)
 */
export function getRecentSemesters(
  available: string[],
  maximumNumber: number = 4, // By default, return up to the last 4 long-semesters
) {
  // get current month and year
  const today = new Date();
  const mm = today.getMonth() + 1; // January is 1
  let yyyy = today.getFullYear();

  let season = 'F';
  if (mm <= 5)
    // jan - may
    season = 'S';
  else season = 'F';

  // generate recent semesters dynamically from the current day
  const recentSemesters: string[] = [];
  for (let i = maximumNumber; i >= 1; i--) {
    if (season === 'S') {
      // then the previous semester is last year's Fall
      yyyy = yyyy - 1;
      season = 'F';
    } else {
      // then the previous long-semester is this year's Spring
      season = 'S';
    }

    recentSemesters.push(yyyy.toString().substring(2) + season);
  }

  return recentSemesters.filter((value) => available.includes(value));
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
