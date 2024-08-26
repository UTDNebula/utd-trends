/*
Build the combos table
*/
import * as fs from 'fs';

import * as aggregatedData from '../data/autocomplete_data.json';
import SearchQuery from '../modules/SearchQuery/SearchQuery';
import searchQueryEqual from '../modules/searchQueryEqual/searchQueryEqual';

export type TableType = { [key: string]: SearchQuery[] };

const table: TableType = {};

function addCombo(
  prefix: string,
  number: string,
  sectionNumber: string,
  profFirst: string,
  profLast: string,
) {
  const courseString = prefix + ' ' + number;
  const profString = profFirst + ' ' + profLast;
  const courseObject: SearchQuery = { prefix, number };
  const profObject: SearchQuery = { profFirst, profLast };
  if (!Object.prototype.hasOwnProperty.call(table, courseString)) {
    table[courseString] = [profObject];
  } else if (
    table[courseString].findIndex((x) => searchQueryEqual(profObject, x)) === -1
  ) {
    table[courseString].push(profObject);
  }
  if (!Object.prototype.hasOwnProperty.call(table, profString)) {
    table[profString] = [courseObject];
  } else if (
    table[profString].findIndex((x) => searchQueryEqual(courseObject, x)) === -1
  ) {
    table[profString].push(courseObject);
  }
  if (sectionNumber === 'HON') {
    const courseWSectionString = prefix + ' ' + number + '.' + sectionNumber;
    const courseWSectionObject: SearchQuery = {
      prefix,
      number,
      sectionNumber,
    };
    if (!Object.prototype.hasOwnProperty.call(table, courseWSectionString)) {
      table[courseWSectionString] = [profObject];
    } else if (
      table[courseWSectionString].findIndex((x) =>
        searchQueryEqual(profObject, x),
      ) === -1
    ) {
      table[courseWSectionString].push(profObject);
    }
    if (!Object.prototype.hasOwnProperty.call(table, profString)) {
      table[profString] = [courseWSectionObject];
    } else if (
      table[profString].findIndex((x) =>
        searchQueryEqual(courseWSectionObject, x),
      ) === -1
    ) {
      table[profString].push(courseWSectionObject);
    }
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
    for (
      let academicSessionItr = 0;
      academicSessionItr < courseNumberData.academic_sessions.length;
      academicSessionItr++
    ) {
      const academicSessionData =
        courseNumberData.academic_sessions[academicSessionItr];
      for (
        let sectionItr = 0;
        sectionItr < academicSessionData.sections.length;
        sectionItr++
      ) {
        const sectionData = academicSessionData.sections[sectionItr];
        for (
          let professorItr = 0;
          professorItr < sectionData.professors.length;
          professorItr++
        ) {
          const professorData = sectionData.professors[professorItr];
          if (
            'first_name' in professorData && //handle empty professor: {}
            'last_name' in professorData &&
            professorData.first_name !== '' && //handle blank name
            professorData.last_name !== ''
          ) {
            addCombo(
              prefixData.subject_prefix,
              courseNumberData.course_number,
              sectionData.section_number,
              professorData.first_name,
              professorData.last_name,
            );
          }
        }
      }
    }
  }
}

fs.writeFileSync('data/combo_table.json', JSON.stringify(table));

console.log('Combo table generation done.');
