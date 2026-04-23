import FilterChip from '@/components/search/Filters/base/FilterChip';
import type { FilterBarChipProps } from '@/modules/filters';
import {
  compareSemesters,
  displaySemesterName,
  getRecentSemesters,
} from '@/modules/semesters';
import {
  Checkbox,
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';

type SemesterFilterChipProps = FilterBarChipProps<{
  semesters: string[];
  chosenSemesters: string[];
  setChosenSemesters: React.Dispatch<React.SetStateAction<string[]>>;
}>;

export default function SemesterFilterChip({
  type,
  dirty,
  disableAutoDirty,
  data: { semesters, chosenSemesters, setChosenSemesters },
}: SemesterFilterChipProps) {
  const defaultSemesters = semesters;
  const isDefault = chosenSemesters.length === semesters.length;
  if (type === 'delete' && isDefault) return;

  const recentSemesters = getRecentSemesters(semesters);

  return (
    <Tooltip title="Include grade data from these semesters" placement="top">
      <FilterChip
        action={type}
        onDelete={() => {
          setChosenSemesters(defaultSemesters);
        }}
        label="Semesters"
        renderValue={
          chosenSemesters.length > 0
            ? chosenSemesters.length === semesters.length
              ? 'All'
              : chosenSemesters.sort(compareSemesters).join(', ')
            : 'None'
        }
        dirty={dirty ?? (!disableAutoDirty && !isDefault)}
      >
        <MenuList className="*:pr-6">
          <MenuItem
            className="h-10 items-center"
            value="select-all"
            onClick={() => {
              if (chosenSemesters.length === semesters.length) {
                setChosenSemesters([]);
              } else {
                setChosenSemesters(defaultSemesters);
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
