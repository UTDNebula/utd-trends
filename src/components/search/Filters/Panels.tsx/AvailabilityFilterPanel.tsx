import type { FilterModalPanelProps } from '@/modules/filters';
import { setParams } from '@/modules/searchParams';
import { displaySemesterName } from '@/modules/semesters';
import FilterList, { type FilterListItem } from '../FilterList';
import FilterPanel from '../FilterPanel';

type AvailabilityFilterPanelProps = FilterModalPanelProps<{
  enabled: boolean;
  semester: string;
  availableSemesters: string[];
}>;

export default function AvailabilityFilterPanel({
  data: { availableSemesters, enabled, semester },
}: AvailabilityFilterPanelProps) {
  const value = enabled ? semester : 'any';

  const semesterOptions: FilterListItem[] = availableSemesters.map((sem) => ({
    label: displaySemesterName(sem, false),
    value: sem,
  }));

  return (
    <FilterPanel heading="Teaching in">
      <FilterList
        options={[{ label: 'Any semester', value: 'any' }, ...semesterOptions]}
        type="radio"
        selectedValues={[value]}
        disallowDeselecting
        onChange={(newSelectedValues) => {
          const newValue = newSelectedValues[0];
          setParams((params) => {
            if (newValue !== 'any') {
              params.set('availability', newValue);
            } else {
              params.delete('availability');
            }
          });
        }}
      />
    </FilterPanel>
  );
}
