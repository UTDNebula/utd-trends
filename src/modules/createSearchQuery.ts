import untypedComboTable from '@/data/combo_table.json';
import {
  convertToCourseOnly,
  convertToProfOnly,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
} from '@/types/SearchQuery';

const comboTable = untypedComboTable as { [key: string]: SearchQuery[] };

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
