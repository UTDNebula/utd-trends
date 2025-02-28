/** Returns the current semester based on today's month and year */
export function getCurrentSemester() {
  // get current month and year
  const today = new Date();
  const mm = today.getMonth() + 1; // January is 1
  const yyyy = today.getFullYear();

  let season = 'F';
  if (mm <= 5)
    // jan - may
    season = 'S';
  else season = 'F';

  return {
    season: season,
    yyyy: yyyy,
  };
}

/** returns the season and yyyy of the previous long semester */
export function getLastLongSemester(season: string, yyyy: number) {
  if (season === 'S') {
    // then the previous semester is last year's Fall
    yyyy = yyyy - 1;
    season = 'F';
  } // then the previous long-semester is this year's Spring
  else season = 'S';

  return {
    season: season,
    yyyy: yyyy,
  };
}

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

export function displayAcademicSessionName(id: string, yearFirst: boolean) {
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
