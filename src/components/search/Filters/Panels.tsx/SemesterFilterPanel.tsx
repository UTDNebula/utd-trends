import FilterPanel from '@/components/search/Filters/base/FilterPanel';
import type { FilterModalPanelProps } from '@/modules/filters';
import {
  compareSemesters,
  displaySemesterName,
  getRecentSemesters,
} from '@/modules/semesters';
import {
  Checkbox,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';

type SemesterFilterPanelProps = FilterModalPanelProps<{
  semesters: string[];
  chosenSemesters: string[];
  setChosenSemesters: React.Dispatch<React.SetStateAction<string[]>>;
}>;

export default function SemesterFilterPanel({
  data: { chosenSemesters, semesters, setChosenSemesters },
}: SemesterFilterPanelProps) {
  const recentSemesters = getRecentSemesters(semesters);

  return (
    <FilterPanel heading="Semesters" id="filter-semesters">
      <Grid container spacing={3} marginTop={1}>
        <FormControl size="small" className="w-full">
          <Select
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
            displayEmpty
            renderValue={(selected) => {
              if (selected.length === semesters.length) {
                return <span className="italic">All selected</span>;
              } else if (selected.length === 0) {
                return <span className="italic">None selected</span>;
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
          <FormHelperText>
            Include grade data from these semesters
          </FormHelperText>
        </FormControl>
      </Grid>
    </FilterPanel>
  );
}
