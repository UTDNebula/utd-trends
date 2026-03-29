'use client';

import { displaySemesterName } from '@/modules/semesters';
import {
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  Tooltip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

type Props = {
  enabled: boolean;
  onEnabledChangeAction: (enabled: boolean) => void;
  semester: string;
  onSemesterChangeAction: (semester: string) => void;
  availableSemesters: string[];
  disabled?: boolean;
  formControlClassName?: string;
  selectClassName?: string;
  tooltipTitle?: string;
};

export default function TeachingSemesterSelector({
  enabled,
  onEnabledChangeAction,
  semester,
  onSemesterChangeAction,
  availableSemesters,
  disabled = false,
  formControlClassName = '',
  selectClassName = 'min-w-[120px]',
  tooltipTitle = 'Filter results to courses taught in this semester',
}: Props) {
  return (
    <Tooltip title={tooltipTitle} placement="top">
      <div
        className={`flex w-full flex-wrap items-center ${formControlClassName}`}
      >
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onEnabledChangeAction(event.target.checked)
              }
              disabled={disabled}
            />
          }
          label="Teaching in"
        />
        {availableSemesters.length > 0 && (
          <Select
            size="small"
            value={semester}
            onChange={(e: SelectChangeEvent) =>
              onSemesterChangeAction(e.target.value)
            }
            displayEmpty
            disabled={disabled || !enabled}
            renderValue={(v) =>
              v ? displaySemesterName(v, false) : 'Teaching Next Semester'
            }
            className={selectClassName}
          >
            {availableSemesters.map((sem) => (
              <MenuItem key={sem} value={sem}>
                {displaySemesterName(sem, false)}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
    </Tooltip>
  );
}
