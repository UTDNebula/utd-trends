import type { FilterDefaultsType } from '@/modules/filters';
import type { SearchResult } from '@/types/SearchQuery';
import AvailabilityFilterChip from './Chips/AvailabilityFilterChip';
import MinLetterGradeFilterChip from './Chips/MinLetterGradeFilterChip';
import MinRatingFilterChip from './Chips/MinRatingFilterChip';
import SectionTypeFilterChip from './Chips/SectionTypeFilterChip';
import SemesterFilterChip from './Chips/SemesterFilterChip';

type FilterChipsProps = {
  filterChipType: 'delete' | 'popover';
  defaultChecks: { [K in keyof FilterDefaultsType]: boolean };
  data: {
    chosenSectionTypes: string[];
    chosenSemesters: string[];
    minGPA: string;
    minRating: string;
    semesters: string[];
    semFilteredResults: SearchResult[];
    sectionTypes: string[];
    setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
    setChosenSemesters: React.Dispatch<React.SetStateAction<string[]>>;
    filterNextSem: boolean;
    effectiveTeachingSemester: string;
    availableSemesters: string[];
  };
};

export function getFilterChipsArray({
  filterChipType,
  defaultChecks,
  data,
}: FilterChipsProps) {
  const {
    availableSemesters,
    chosenSectionTypes,
    chosenSemesters,
    filterNextSem,
    minGPA,
    minRating,
    sectionTypes,
    semFilteredResults,
    effectiveTeachingSemester,
    semesters,
    setChosenSectionTypes,
    setChosenSemesters,
  } = data;

  return [
    <MinLetterGradeFilterChip
      type={filterChipType}
      dirty={!defaultChecks.minGPA}
      disableAutoDirty
      key="minLetterGrade"
      data={{
        chosenSectionTypes,
        chosenSemesters,
        minGPA,
        minRating,
        sectionTypes,
        semesters,
        semFilteredResults,
      }}
    />,
    <MinRatingFilterChip
      type={filterChipType}
      dirty={!defaultChecks.minRating}
      disableAutoDirty
      key="minRating"
      data={{
        chosenSectionTypes,
        chosenSemesters,
        minGPA,
        minRating,
        semFilteredResults,
      }}
    />,
    <SemesterFilterChip
      type={filterChipType}
      dirty={!defaultChecks.chosenSemesters}
      disableAutoDirty
      key="semester"
      data={{ chosenSemesters, semesters, setChosenSemesters }}
    />,
    <SectionTypeFilterChip
      type={filterChipType}
      dirty={!defaultChecks.chosenSectionTypes}
      disableAutoDirty
      key="sectionType"
      data={{ chosenSectionTypes, sectionTypes, setChosenSectionTypes }}
    />,
    <AvailabilityFilterChip
      type={filterChipType}
      dirty={filterNextSem} // Exception: Show dirty if specific semester is selected
      disableAutoDirty
      key="availability"
      data={{
        availableSemesters,
        enabled: filterNextSem,
        semester: effectiveTeachingSemester,
      }}
    />,
  ];
}

export default function FilterChips(props: FilterChipsProps) {
  return <>{getFilterChipsArray(props)}</>;
}
