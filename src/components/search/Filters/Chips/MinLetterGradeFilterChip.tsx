import FilterChip from '@/components/search/Filters/base/FilterChip';
import {
  filterMinGPAs,
  getGradeCounts,
  type FilterBarChipProps,
} from '@/modules/filters';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import { MenuItem, MenuList, Tooltip } from '@mui/material';

type MinLetterGradeFilterChipProps = FilterBarChipProps<{
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semesters: string[];
  semFilteredResults: SearchResult[];
  sectionTypes: string[];
}>;

export default function MinLetterGradeFilterChip({
  type,
  dirty,
  disableAutoDirty,
  data,
}: MinLetterGradeFilterChipProps) {
  const { minGPA } = data;

  const isDefault = !Boolean(minGPA);
  if (type === 'delete' && isDefault) return;

  const gradeCounts: Record<string, number> = getGradeCounts(data);

  return (
    <Tooltip
      title="Minimum course letter grade average"
      placement="top"
      disableInteractive
    >
      <FilterChip
        action={type}
        onDelete={() => {
          setParams((params) => {
            params.delete('minGPA');
          });
        }}
        label="Min Letter Grade"
        renderValue={minGPA ? gpaToLetterGrade(Number(minGPA)) : undefined}
        dirty={dirty ?? (!disableAutoDirty && !isDefault)}
      >
        {(ctx) => (
          <MenuList autoFocusItem={ctx.open}>
            <MenuItem
              className="h-10"
              value=""
              selected={minGPA === ''}
              aria-selected={minGPA === ''}
              onClick={() => {
                setParams((params) => {
                  params.delete('minGPA');
                });
                ctx.closePopover();
              }}
            >
              <em className="italic">None</em>
            </MenuItem>
            {filterMinGPAs.map((value) => (
              <MenuItem
                className="h-10"
                key={value}
                value={value}
                selected={minGPA === value}
                aria-selected={minGPA === value}
                onClick={() => {
                  setParams((params) => {
                    params.set('minGPA', value);
                  });
                  ctx.closePopover();
                }}
              >
                <span className="w-5">{gpaToLetterGrade(Number(value))}</span>
                <span className="text-sm text-gray-400 ml-2">
                  ({gradeCounts[value] ?? 0})
                </span>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </FilterChip>
    </Tooltip>
  );
}
