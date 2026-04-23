import { compareSemesters, displaySemesterName } from '@/modules/semesters';
import {
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import { type Dispatch, type SetStateAction } from 'react';
import FilterPanel from '../FilterPanel';
import { type FilterModalPanelProps } from '../utils';

type SemesterFilterPanelProps = FilterModalPanelProps<{
  semesters: string[];
  chosenSemesters: string[];
  setChosenSemesters: Dispatch<SetStateAction<string[]>>;
}>;

export default function SemesterFilterPanel({
  data: { chosenSemesters, semesters, setChosenSemesters },
}: SemesterFilterPanelProps) {
  const MAX_NUM_RECENT_SEMESTERS = 4; // recentSemesters will have up to the last 4 long-semesters
  const recentSemesters = getRecentSemesters(); // recentSemesters contains semesters offered in the last 2 years; recentSemesters.length = [0, 4] range

  function getRecentSemesters() {
    // get current month and year
    const today = new Date();
    const mm = today.getMonth() + 1; // January is 1
    let yyyy = today.getFullYear();

    let season = 'F';
    if (mm <= 5)
      // jan - may
      season = 'S';
    else season = 'F';

    // generate recent semesters dynamically from the current day
    const recentSemesters: string[] = [];
    for (let i = MAX_NUM_RECENT_SEMESTERS; i >= 1; i--) {
      if (season === 'S') {
        // then the previous semester is last year's Fall
        yyyy = yyyy - 1;
        season = 'F';
      } else {
        // then the previous long-semester is this year's Spring
        season = 'S';
      }

      recentSemesters.push(yyyy.toString().substring(2) + season);
    }

    return recentSemesters.filter((value) => semesters.includes(value));
  }

  return (
    <FilterPanel heading="Included grade data">
      <FormControl size="small" className="w-full">
        <InputLabel id="Semesters">Semesters</InputLabel>
        <Select
          label="Semesters"
          labelId="Semesters"
          multiple
          value={chosenSemesters}
          slotProps={{
            root: {
              className:
                chosenSemesters.length !== semesters.length
                  ? 'bg-cornflower-50 dark:bg-cornflower-900'
                  : 'bg-white dark:bg-neutral-900',
            },
          }}
          onChange={(event) => {
            const {
              target: { value },
            } = event;
            if (value.includes('select-all')) {
              if (chosenSemesters.length === semesters.length) {
                setChosenSemesters([]);
              } else {
                setChosenSemesters(semesters);
              }
            } else if (value.includes('recent')) {
              if (
                chosenSemesters.length === recentSemesters.length &&
                chosenSemesters.every((el) => recentSemesters.includes(el))
              ) {
                setChosenSemesters(semesters);
              } else {
                setChosenSemesters(recentSemesters);
              }
            } else {
              {
                /*If all semesters were selected, select only clicked semester*/
              }
              if (chosenSemesters.length === semesters.length) {
                const clickedItem = chosenSemesters.find(
                  (x) => !value.includes(x),
                );
                if (clickedItem) {
                  setChosenSemesters([clickedItem]);
                }
              } else {
                setChosenSemesters(value as string[]);
              }
            }
          }}
          renderValue={(selected) => {
            if (chosenSemesters.length === semesters.length) {
              return 'All selected';
            }
            return selected.sort(compareSemesters).join(', ');
          }}
          MenuProps={{ autoFocus: false }}
        >
          {/* select all sessions */}
          <MenuItem className="h-10 items-center" value="select-all">
            <Checkbox
              checked={
                semesters.length > 0 &&
                chosenSemesters.length === semesters.length
              }
              indeterminate={
                chosenSemesters.length !== semesters.length &&
                chosenSemesters.length !== 0 &&
                !(
                  chosenSemesters.length === recentSemesters.length &&
                  chosenSemesters.every((el) => recentSemesters.includes(el))
                ) // select-all is not indeterminate when recent is checked
              }
              disabled={semesters.length == 0}
            />
            <ListItemText
              className={semesters.length > 0 ? '' : 'text-gray-400'}
              primary="Select All"
            />
          </MenuItem>

          {/* recent sessions -- last <recentSemesters.length> long-semesters from current semester*/}
          <MenuItem className="h-10 items-center" value="recent">
            <Checkbox
              checked={
                recentSemesters.length > 0 &&
                chosenSemesters.length === recentSemesters.length &&
                chosenSemesters.every((el) => recentSemesters.includes(el))
              }
              disabled={recentSemesters.length == 0}
            />
            <ListItemText
              className={recentSemesters.length > 0 ? '' : 'text-gray-400'}
              primary="Recent"
            />
          </MenuItem>

          <Divider component="li" />

          {/* individual options */}
          {semesters.map((session) => (
            <MenuItem
              className="h-10 items-center"
              key={session}
              value={session}
            >
              <Checkbox checked={chosenSemesters.includes(session)} />
              <ListItemText primary={displaySemesterName(session)} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Include grade data from these semesters</FormHelperText>
      </FormControl>
    </FilterPanel>
  );
}
