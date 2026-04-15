import { compareSemesters, displaySemesterName } from '@/modules/semesters';
import {
  Checkbox,
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';
import { type Dispatch, type SetStateAction } from 'react';
import FilterChip from '../FilterChip';

type SemesterFilterChipProps = {
  semesters: string[];
  chosenSemesters: string[];
  setChosenSemesters: Dispatch<SetStateAction<string[]>>;
};

export default function SemesterFilterChip({
  semesters,
  chosenSemesters,
  setChosenSemesters,
}: SemesterFilterChipProps) {
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
    <Tooltip title="Semesters to include grades from" placement="top">
      <FilterChip
        label="Semesters"
        renderValue={
          chosenSemesters.length > 0
            ? chosenSemesters.length === semesters.length
              ? 'All'
              : chosenSemesters.sort(compareSemesters).join(', ')
            : 'None'
        }
        dirty={chosenSemesters.length !== semesters.length}
      >
        <MenuList className="*:pr-6">
          <MenuItem
            className="h-10 items-center"
            value="select-all"
            onClick={() => {
              if (chosenSemesters.length === semesters.length) {
                setChosenSemesters([]);
              } else {
                setChosenSemesters(semesters);
              }
            }}
          >
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
          <MenuItem
            className="h-10 items-center"
            value="recent"
            onClick={() => {
              if (
                chosenSemesters.length === recentSemesters.length &&
                chosenSemesters.every((el) => recentSemesters.includes(el))
              ) {
                setChosenSemesters(semesters);
              } else {
                setChosenSemesters(recentSemesters);
              }
            }}
          >
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
              onClick={() => {
                /* If all are selected, select only the clicked item */
                if (chosenSemesters.length === semesters.length) {
                  setChosenSemesters([session]);
                } else {
                  setChosenSemesters((prev) => {
                    const newArray = [...prev];
                    const index = newArray.indexOf(session);
                    if (index > -1) {
                      newArray.splice(index, 1);
                    } else {
                      newArray.push(session);
                    }
                    return newArray;
                  });
                }
              }}
            >
              <Checkbox checked={chosenSemesters.includes(session)} />
              <ListItemText primary={displaySemesterName(session)} />
            </MenuItem>
          ))}
        </MenuList>
      </FilterChip>
    </Tooltip>
  );
}
