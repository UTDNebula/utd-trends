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

export function displaySemesterName(id: string) {
  return (
    '20' +
    id.slice(0, 2) +
    ' ' +
    { U: 'Summer', F: 'Fall', S: 'Spring' }[id.slice(2)]
  );
}
