import { useSharedState } from '@/app/SharedStateProvider';
import { setAvailabilitySemester } from '@/modules/availability';
import { displaySemesterName } from '@/modules/semesters';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export default function MyPlannerEmpty() {
  const { effectiveTeachingSemester, setTeachingSemester, availableSemesters } =
    useSharedState();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-4 pb-0">
        <Typography variant="h2" className="leading-tight text-3xl font-bold">
          {'My Planner' +
            (effectiveTeachingSemester
              ? ' — ' + displaySemesterName(effectiveTeachingSemester, false)
              : '')}
        </Typography>
        {availableSemesters.length > 0 && (
          <FormControl size="small" className="min-w-35">
            <InputLabel id="planner-teaching-semester">Semester</InputLabel>
            <Select
              labelId="planner-teaching-semester"
              label="Semester"
              size="small"
              value={effectiveTeachingSemester}
              onChange={(e: SelectChangeEvent) => {
                const newSemester = e.target.value;
                setTeachingSemester(newSemester);
                const params = new URLSearchParams(searchParams.toString());
                setAvailabilitySemester(params, newSemester);
                router.replace(`/planner?${params.toString()}`, {
                  scroll: false,
                });
              }}
              renderValue={(v) =>
                v ? displaySemesterName(v, false) : 'Select semester'
              }
              className="bg-white dark:bg-haiti"
            >
              {availableSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {displaySemesterName(sem, false)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
      <Typography variant="h3" className="text-2xl p-4">
        {'Add a course on the search results page with the '}
        <BookOutlinedIcon className="text-2xl" />
        {' icon.'}
      </Typography>
    </>
  );
}
