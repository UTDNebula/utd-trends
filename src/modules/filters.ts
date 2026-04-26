import { calculateGrades } from '@/modules/fetchGrades';
import { createParamSetter } from '@/modules/searchParams';
import { type SearchResult } from '@/types/SearchQuery';

export type FilterParamsSchema = {
  minGPA: string;
  minRating: string;
  availability: string;
};

export const setFilterParams = createParamSetter<FilterParamsSchema>();

export type FilterDefaultsType = {
  minGPA: string;
  minRating: string;
  chosenSemesters: string[];
  chosenSectionTypes: string[];
  availability: string;
};

export function clearAllFilters(
  defaults: FilterDefaultsType,
  mutators: {
    setChosenSemesters: React.Dispatch<React.SetStateAction<string[]>>;
    setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
  },
) {
  setFilterParams((params) => {
    const setOrDelete = (name: keyof FilterParamsSchema, value: string) => {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    };
    setOrDelete('minGPA', defaults.minGPA);
    setOrDelete('minRating', defaults.minRating);
    setOrDelete('availability', defaults.availability);
  });
  mutators.setChosenSemesters(defaults.chosenSemesters);
  mutators.setChosenSectionTypes(defaults.chosenSectionTypes);
}

export type FilterBarChipProps<Data extends Record<string, unknown>> = {
  type?: 'delete' | 'popover';
  dirty?: boolean;
  /**
   * By default, the filter bar chips will automatically determine if they're dirty or not. This prop disables that.
   */
  disableAutoDirty?: boolean;
  data: Data;
};

export type FilterModalPanelProps<Data extends Record<string, unknown>> = {
  data: Data;
};

////////////////////////////////////////////////////////////////////////////////
// COUNTERS
////////////////////////////////////////////////////////////////////////////////

export const filterMinGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];

/**
 * Counts number of filter results for each letter grade
 * @param data Required data used to calculate count
 */
export function getGradeCounts(data: {
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minRating: string;
  semesters: string[];
  semFilteredResults: SearchResult[];
  sectionTypes: string[];
}) {
  const gradeCounts: Record<string, number> = {};

  const {
    chosenSectionTypes,
    chosenSemesters,
    minRating,
    sectionTypes,
    semFilteredResults,
    semesters,
  } = data;

  filterMinGPAs.forEach((gpaString) => {
    const gpaNum = parseFloat(gpaString);
    gradeCounts[gpaString] = semFilteredResults.filter((result) => {
      if (result.type !== 'course') {
        if (
          typeof minRating === 'string' &&
          result.RMP &&
          result.RMP.avgRating < parseFloat(minRating)
        )
          return false;
      }
      const courseGrades = result.grades;
      return (
        (courseGrades &&
          calculateGrades(courseGrades, chosenSemesters, chosenSectionTypes)
            .gpa >= gpaNum) ||
        (courseGrades === undefined &&
          chosenSemesters.length === semesters.length &&
          chosenSectionTypes.length === sectionTypes.length)
      );
    }).length;
  });

  return gradeCounts;
}

export const filterMinRatings = [
  '4.5',
  '4',
  '3.5',
  '3',
  '2.5',
  '2',
  '1.5',
  '1',
  '0.5',
];

/**
 * Counts number of filter results for each RateMyProfessor rating
 * @param data Required data used to calculate count
 */
export function getRmpCounts(data: {
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  semFilteredResults: SearchResult[];
}) {
  const rmpCounts: Record<string, number> = {};

  const { chosenSectionTypes, chosenSemesters, minGPA, semFilteredResults } =
    data;

  filterMinRatings.forEach((ratingString) => {
    const ratingNum = parseFloat(ratingString);
    rmpCounts[ratingString] = semFilteredResults.filter((result) => {
      // gpa filter
      const calculated = calculateGrades(
        result.grades,
        chosenSemesters,
        chosenSectionTypes,
      );
      if (typeof minGPA === 'string' && calculated.gpa < parseFloat(minGPA))
        return false;
      if (
        typeof ratingNum === 'number' &&
        result.type !== 'course' &&
        result.RMP &&
        result.RMP.avgRating < ratingNum
      )
        return false;
      return true;
    }).length;
  });

  return rmpCounts;
}
