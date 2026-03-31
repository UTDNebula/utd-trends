import untyped_aggregate_table from '@/data/course_aggregates_table.json'; // for aggregate searching of courses, eg CS23XX

const aggregate_table = untyped_aggregate_table as {
  [prefix: string]: {
    [firstDigit: string]: {
      [secondDigit: string]: string[];
    };
  };
};

export function getAggregateOption(newInputValue: string) {
  // create aggregate value for partial course number searching
  if (newInputValue.length >= 3) {
    const prefixMatch = newInputValue.match(/[a-zA-Z]{2,4}/);
    const numberMatch = newInputValue.match(/[0-9]{1,4}/);
    if (prefixMatch && numberMatch && numberMatch[0].length < 3) {
      const prefix = prefixMatch[0].toUpperCase();
      const number = numberMatch[0] + 'X'.repeat(4 - numberMatch[0].length);
      const firstDigit = numberMatch[0][0];
      if (prefix in aggregate_table && firstDigit in aggregate_table[prefix]) {
        const firstDigitTable = aggregate_table[prefix][firstDigit];

        const coursesCount =
          numberMatch[0].length > 1
            ? numberMatch[0][1] in firstDigitTable
              ? firstDigitTable[numberMatch[0][1]].length
              : 0
            : Object.values(firstDigitTable).reduce(
                (sum, courses) => sum + courses.length,
                0,
              );

        if (coursesCount > 1) {
          return {
            subtitle: `All ${prefix} courses starting with ${numberMatch[0]}`,
            prefix: prefix,
            number: number,
          };
        }
      }
    }
  }
  return null;
}
