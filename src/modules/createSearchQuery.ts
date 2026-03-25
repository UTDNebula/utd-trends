import untypedComboTable from '@/data/combo_table.json';
import untyped_aggregate_table from '@/data/course_aggregates_table.json'; // for aggregate searching of courses, eg CS23XX
import {
  convertToCourseOnly,
  convertToProfOnly,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
} from '@/types/SearchQuery';

const comboTable = untypedComboTable as { [key: string]: SearchQuery[] };
const aggregate_table = untyped_aggregate_table as {
  [prefix: string]: {
    [firstDigit: string]: {
      [secondDigit: string]: string[];
    };
  };
};
//Get all course+prof combos for searchTerms and keep only the ones that match filterTerms
//When filterTerms is blank, just gets all searchTerms
//When both paramaters are defined this validates that a combo exists
export function createSearchQuery(
  searchTerms: SearchQuery[],
  filterTerms: SearchQuery[], //filterTerms is blank if the searchTerms are ALL courses or ALL professors
) {
  return searchTerms
    .flatMap((searchTerm) => {
      if (!(searchQueryLabel(searchTerm) in comboTable)) {        
        if (searchTerm.prefix && searchTerm.number && /^(([0-9]X{3})|([0-9]{2}X{2}))$/.test(searchTerm.number)) // this is an aggregate query, eg CS23XX
        {
          const number = searchTerm.number.replaceAll('X','');
          const firstDigitTable = aggregate_table[searchTerm.prefix][number[0]];

          const courses : String[] =
              number.length > 1
                ? number[1] in firstDigitTable
                  ? firstDigitTable[number[1]]
                  : []
                : Object.values(firstDigitTable).flat();
          
          return courses.map((courseNumber) => { return {
            prefix: courseNumber.substring(0,courseNumber.length - 5), 
            number: courseNumber.substring(courseNumber.length-4)}}
          );
        }
        return [];
      }
            
      return [searchTerm].concat(
        comboTable[searchQueryLabel(searchTerm)].map((combo) => ({
          ...searchTerm,
          ...combo,
        })),
      );
    })
    .filter(
      (searchTerm) =>
        !filterTerms.length ||
        filterTerms.find(
          (filterTerm) =>
            searchQueryEqual(convertToCourseOnly(searchTerm), filterTerm) ||
            searchQueryEqual(convertToProfOnly(searchTerm), filterTerm),
        ),
    );
}
