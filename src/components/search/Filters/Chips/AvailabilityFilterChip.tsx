import { setParams } from '@/modules/searchParams';
import { displaySemesterName } from '@/modules/semesters';
import { MenuItem, MenuList, Tooltip } from '@mui/material';
import React from 'react';
import FilterChip from '../FilterChip';
import { type FilterBarChipProps } from '../utils';

type AvailabilityFilterChipProps = FilterBarChipProps & {
  enabled: boolean;
  semester: string;
  availableSemesters: string[];
  /**
   * Prevents component from storing new value in URL search params.
   * @default false
   */
  disableSearchParams?: boolean;
  onChange?: (enabled: boolean, semester: string) => void;
  className?: string;
};

export default function AvailabilityFilterChip({
  type,
  dirty,
  disableAutoDirty,
  enabled,
  semester,
  availableSemesters,
  disableSearchParams = false,
  onChange,
  className,
}: AvailabilityFilterChipProps) {
  const defaultSemester = availableSemesters[0];
  const isDefault = enabled && semester === defaultSemester;
  if (type === 'delete' && isDefault) return;

  return (
    <Tooltip
      title="Filter results to courses taught in this semester"
      placement="top"
      disableInteractive
    >
      <FilterChip
        action={type}
        onDelete={() => {
          setParams((params) => {
            params.set('availability', defaultSemester);
          });
        }}
        label="Teaching in"
        renderValue={enabled ? displaySemesterName(semester, false) : 'Any'}
        dirty={dirty ?? (!disableAutoDirty && !isDefault)}
        className={className}
      >
        {(ctx) => (
          <MenuList autoFocusItem={ctx.open}>
            <MenuItem
              className="h-10"
              value=""
              selected={!enabled}
              aria-selected={!enabled}
              onClick={() => {
                if (!disableSearchParams) {
                  setParams((params) => {
                    params.delete('availability');
                  });
                }
                onChange?.(false, semester);
                ctx.closePopover();
              }}
            >
              <em className="italic">Any semester</em>
            </MenuItem>
            {availableSemesters.map((sem) => (
              <MenuItem
                className="h-10"
                key={sem}
                value={sem}
                selected={enabled && semester === sem}
                aria-selected={enabled && semester === sem}
                onClick={() => {
                  if (!disableSearchParams) {
                    setParams((params) => {
                      params.set('availability', sem);
                    });
                  }
                  onChange?.(true, sem);
                  ctx.closePopover();
                }}
              >
                {displaySemesterName(sem, false)}
              </MenuItem>
            ))}
          </MenuList>
        )}
      </FilterChip>
    </Tooltip>
  );
}
