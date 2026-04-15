import { setParams } from '@/modules/searchParams';
import { displaySemesterName } from '@/modules/semesters';
import { FormControl, FormControlLabel, Switch, Tooltip } from '@mui/material';
import React from 'react';
import FilterChip from '../FilterChip';

type AvailabilityFilterChipProps = {
  filterNextSem: boolean;
  latestSemester: string;
};

export default function AvailabilityFilterChip({
  filterNextSem,
  latestSemester,
}: AvailabilityFilterChipProps) {
  return (
    <Tooltip title="Availability" placement="top">
      <FilterChip
        label="Availability"
        renderValue={
          filterNextSem ? displaySemesterName(latestSemester, false) : 'Any'
        }
        dirty={!filterNextSem}
      >
        <div className="mx-4 my-3">
          <FormControl
            size="small"
            className={`${
              filterNextSem
                ? '[&>.MuiInputBase-root]:bg-cornflower-50 dark:[&>.MuiInputBase-root]:bg-cornflower-900'
                : '[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-black'
            }`}
          >
            <FormControlLabel
              className="select-none"
              control={
                <Switch
                  checked={filterNextSem}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setParams((params) => {
                      if (event.target.checked) {
                        params.set('availability', 'true');
                      } else {
                        params.delete('availability');
                      }
                    });
                  }}
                />
              }
              label={
                latestSemester == ''
                  ? 'Teaching Next Semester'
                  : 'Teaching in ' + displaySemesterName(latestSemester, false)
              }
            />
          </FormControl>
        </div>
      </FilterChip>
    </Tooltip>
  );
}
