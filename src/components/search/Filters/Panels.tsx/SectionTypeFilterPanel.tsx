import FilterList, {
  type FilterListItem,
} from '@/components/search/Filters/base/FilterList';
import FilterPanel from '@/components/search/Filters/base/FilterPanel';
import type { FilterModalPanelProps } from '@/modules/filters';
import {
  displaySectionTypeName,
  othersSentinalValue,
} from '@/modules/semesters';
import ListItemText from '@mui/material/ListItemText';

const selectAllSentinelValue = 'select-all';

type SectionTypeFilterPanelProps = FilterModalPanelProps<{
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
}>;

export default function SectionTypeFilterPanel({
  data: { chosenSectionTypes, sectionTypes, setChosenSectionTypes },
}: SectionTypeFilterPanelProps) {
  const isDefault = chosenSectionTypes.length === sectionTypes.length;

  const sectionTypeOptions: FilterListItem[] = sectionTypes.map((section) => ({
    label: displaySectionTypeName(section),
    value: section,
  }));

  return (
    <FilterPanel heading="Section Type" id="filter-section-type">
      <FilterList
        options={[
          {
            label: 'Select all',
            value: selectAllSentinelValue,
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
        disableSelectedBackdrop={isDefault}
        selectedValues={chosenSectionTypes}
        renderOptionContent={(props, option) => (
          <ListItemText
            primary={option.label ?? option.value}
            secondary={
              ![selectAllSentinelValue, othersSentinalValue].includes(
                option.value,
              )
                ? option.value
                : undefined
            }
            slotProps={{
              primary: { className: 'text-sm' },
              secondary: { className: 'text-xs' },
            }}
          />
        )}
        onChange={(newSelectedValues) => {
          if (newSelectedValues.includes(selectAllSentinelValue)) {
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
