import { setParams } from '@/modules/searchParams';
import { displaySemesterName } from '@/modules/semesters';
import { MenuItem, MenuList, Tooltip } from '@mui/material';
import React from 'react';
import FilterChip from '../FilterChip';

type AvailabilityFilterChipProps = {
  enabled: boolean;
  semester: string;
  availableSemesters: string[];
  /**
   * Prevents component from storing new value in URL search params.
   * @default false
   */
  disableSearchParams?: boolean;
  disableDirty?: boolean;
  onChange?: (enabled: boolean, semester: string) => void;
  className?: string;
};

export default function AvailabilityFilterChip({
  enabled,
  semester,
  availableSemesters,
  disableSearchParams = false,
  disableDirty = false,
  onChange,
  className,
}: AvailabilityFilterChipProps) {
  return (
    <Tooltip
      title="Filter results to courses taught in this semester"
      placement="top"
    >
      <FilterChip
        label="Teaching in"
        renderValue={enabled ? displaySemesterName(semester, false) : 'Any'}
        dirty={
          !disableDirty && (!enabled || semester !== availableSemesters[0])
        }
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
              <em className="italic">Any</em>
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
