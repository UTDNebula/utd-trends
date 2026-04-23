import type { FilterModalPanelProps } from '@/modules/filters';
import { displaySectionTypeName } from '@/modules/semesters';
import FilterList, { type FilterListItem } from '../FilterList';
import FilterPanel from '../FilterPanel';

type SectionTypeFilterPanelProps = FilterModalPanelProps<{
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
}>;

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
        disableSelectedBackdrop
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
