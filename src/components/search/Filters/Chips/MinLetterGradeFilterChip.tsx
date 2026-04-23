import { calculateGrades } from '@/modules/fetchGrades';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade';
import { setParams } from '@/modules/searchParams';
import type { SearchResult } from '@/types/SearchQuery';
import { MenuItem, MenuList, Tooltip } from '@mui/material';
import FilterChip from '../FilterChip';
import { type FilterBarChipProps } from '../utils';

type MinLetterGradeFilterChipProps = FilterBarChipProps & {
  chosenSectionTypes: string[];
  chosenSemesters: string[];
  minGPA: string;
  minRating: string;
  semesters: string[];
  semFilteredResults: SearchResult[];
  sectionTypes: string[];
};

const minGPAs = ['3.67', '3.33', '3', '2.67', '2.33', '2'];

export default function MinLetterGradeFilterChip({
  type,
  dirty,
  disableAutoDirty,
  semesters,
  sectionTypes,
  chosenSectionTypes,
  chosenSemesters,
  minGPA,
  minRating,
  semFilteredResults,
}: MinLetterGradeFilterChipProps) {
  const isDefault = !Boolean(minGPA);
  if (type === 'delete' && isDefault) return;

  const gradeCounts: Record<string, number> = {};

  minGPAs.forEach((gpaString) => {
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

  return (
    <Tooltip
      title="Minimum letter grade average"
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
            {minGPAs.map((value) => (
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
