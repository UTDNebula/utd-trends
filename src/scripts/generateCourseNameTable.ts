import { writeFileSync } from 'fs';
import aggregatedData from '../data/aggregated_data.json';
import {
  convertToCourseOnly,
  searchQueryLabel,
  type SearchQuery,
} from '../types/SearchQuery';

export type TableType = { [key: string]: SearchQuery[] };

const table: TableType = {};

function addCourse(title: string, prefix: string, number: string) {
  const courseObject: SearchQuery = { prefix, number };

  if (!Object.prototype.hasOwnProperty.call(table, title)) {
    table[title] = [courseObject];
  } else {
    table[title].push(courseObject);
  }
}

for (let prefixItr = 0; prefixItr < aggregatedData.data.length; prefixItr++) {
  const prefixData = aggregatedData.data[prefixItr];
  for (
    let courseNumberItr = 0;
    courseNumberItr < prefixData.course_numbers.length;
    courseNumberItr++
  ) {
    const courseNumberData = prefixData.course_numbers[courseNumberItr];
    addCourse(
      courseNumberData.title,
      prefixData.subject_prefix,
      courseNumberData.course_number,
    );
  }
}

writeFileSync('src/data/course_name_table.json', JSON.stringify(table));

console.log('Course name table generation done.');

const reverseTable: { [key: string]: string } = {};
for (const [title, queries] of Object.entries(table)) {
  for (const query of queries) {
    if (query.prefix && query.number) {
      const key = searchQueryLabel(convertToCourseOnly(query));
      reverseTable[key] = title;
    }
  }
}

writeFileSync(
  'src/data/course_prefix_number_table.json',
  JSON.stringify(reverseTable),
);

console.log('Course prefix-number table generation done.');

const aggregateTable: {
  [prefix: string]: {
    [firstDigit: string]: { [secondDigit: string]: string[] };
  };
} = {};
// adds the given course label to all of its relevant aggregates in the table
function addToPrefixes(label: string) {
  const [prefix, number] = label.split(' ');
  const firstDigit = number[0];
  const secondDigit = number[1];
  if (!Object.prototype.hasOwnProperty.call(aggregateTable, prefix)) {
    aggregateTable[prefix] = {};
  }
  if (
    !Object.prototype.hasOwnProperty.call(aggregateTable[prefix], firstDigit)
  ) {
    aggregateTable[prefix][firstDigit] = {};
  }
  if (
    !Object.prototype.hasOwnProperty.call(
      aggregateTable[prefix][firstDigit],
      secondDigit,
    )
  ) {
    aggregateTable[prefix][firstDigit][secondDigit] = [];
  }
  aggregateTable[prefix][firstDigit][secondDigit].push(label);
}

Object.entries(reverseTable).forEach(([label]) => addToPrefixes(label));

writeFileSync(
  'src/data/course_aggregates_table.json',
  JSON.stringify(aggregateTable),
);

console.log('Aggregate table generation done.');
