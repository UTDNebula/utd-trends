import { type Dispatch, type SetStateAction } from 'react';
import FilterList, { type FilterListItem } from '../FilterList';
import FilterPanel from '../FilterPanel';
import { type FilterModalPanelProps } from '../utils';

type SectionTypeFilterPanelProps = FilterModalPanelProps<{
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: Dispatch<SetStateAction<string[]>>;
}>;

function displaySectionTypeName(id: string): string {
  const SectionTypesMap: Record<string, string> = {
    '0xx': 'Normal day lecture',
    '0Wx': 'Online class',
    '0Hx': 'Hybrid day class (online + face-to-face)',
    '0Lx': 'LLC-only section',
    '5Hx': 'Hybrid night class (online + face-to-face)',
    '1xx': 'Lab section (sciences)',
    '2xx': 'Discussion section (humanities)',
    '3xx': 'Problem section (maths)',
    '5xx': 'Night lecture (past 5 PM)',
    '6xx': 'Lab night section (past 7 PM)',
    '7xx': 'Exam section',
    HNx: 'Honors-only',
    HON: 'Honors-only',
    xUx: 'Summer Class',
  };

  return SectionTypesMap[id] || id; // Default to ID if no mapping exists
}

export default function SectionTypeFilterPanel({
  data: { chosenSectionTypes, sectionTypes, setChosenSectionTypes },
}: SectionTypeFilterPanelProps) {
  const sectionTypeOptions: FilterListItem[] = sectionTypes.map((section) => ({
    label: displaySectionTypeName(section),
    value: section,
  }));

  return (
    <FilterPanel heading="Section Type">
      <FilterList
        options={[
          {
            label: 'Select all',
            value: 'select-all',
            checkboxOverride: {
              checked:
                sectionTypes.length > 0 &&
                chosenSectionTypes.length === sectionTypes.length,
              indeterminate:
                chosenSectionTypes.length !== sectionTypes.length &&
                chosenSectionTypes.length !== 0,
              disabled: sectionTypes.length == 0,
            },
          },
          { type: 'divider', value: 'div-1' },
          ...sectionTypeOptions,
        ]}
        type="checkbox"
        selectedValues={chosenSectionTypes}
        onChange={(newSelectedValues) => {
          if (newSelectedValues.includes('select-all')) {
            if (chosenSectionTypes.length === sectionTypes.length) {
              setChosenSectionTypes([]);
            } else {
              setChosenSectionTypes(sectionTypes);
            }
          } else {
            if (chosenSectionTypes.length === sectionTypes.length) {
              const clickedItem = chosenSectionTypes.find(
                (x) => !newSelectedValues.includes(x),
              );
              if (clickedItem) {
                setChosenSectionTypes([clickedItem]);
              }
            } else {
              setChosenSectionTypes(newSelectedValues);
            }
          }
        }}
      />
    </FilterPanel>
  );
}
