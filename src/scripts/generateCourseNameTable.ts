import { writeFileSync } from 'fs';

import aggregatedData from '../data/aggregated_data.json';
import { type SearchQuery } from '../types/SearchQuery';

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
