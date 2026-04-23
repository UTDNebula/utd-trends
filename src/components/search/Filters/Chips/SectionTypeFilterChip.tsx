import FilterChip from '@/components/search/Filters/base/FilterChip';
import type { FilterBarChipProps } from '@/modules/filters';
import {
  displaySectionTypeName,
  othersSentinalValue,
} from '@/modules/semesters';
import {
  Checkbox,
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';

const selectAllSentinelValue = 'select-all';

type SectionTypeFilterChipProps = FilterBarChipProps<{
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
}>;

export default function SectionTypeFilterChip({
  type,
  dirty,
  disableAutoDirty,
  data: { sectionTypes, chosenSectionTypes, setChosenSectionTypes },
}: SectionTypeFilterChipProps) {
  const defaultSectionTypes = sectionTypes;
  const isDefault = chosenSectionTypes.length === sectionTypes.length;
  if (type === 'delete' && isDefault) return;

  return (
    <Tooltip
      title="Include grade data from these sections"
      placement="top"
      disableInteractive
    >
      <FilterChip
        action={type}
        onDelete={() => {
          setChosenSectionTypes(defaultSectionTypes);
        }}
        label="Section Types"
        renderValue={
          chosenSectionTypes.length > 0
            ? chosenSectionTypes.length === sectionTypes.length
              ? 'All'
              : chosenSectionTypes.sort().join(', ')
            : 'None'
        }
        dirty={dirty ?? (!disableAutoDirty && !isDefault)}
      >
        <MenuList className="*:pr-6">
          {/* select all section types */}
          <MenuItem
            value="select-all"
            onClick={() => {
              if (chosenSectionTypes.length === sectionTypes.length) {
                setChosenSectionTypes([]);
              } else {
                setChosenSectionTypes(defaultSectionTypes);
              }
            }}
          >
            <Checkbox
              checked={
                sectionTypes.length > 0 &&
                chosenSectionTypes.length === sectionTypes.length
              }
              indeterminate={
                chosenSectionTypes.length !== sectionTypes.length &&
                chosenSectionTypes.length !== 0
              }
              disabled={sectionTypes.length == 0}
            />
            <ListItemText
              className={sectionTypes.length > 0 ? '' : 'text-gray-400'}
              primary="Select All"
            />
          </MenuItem>

          <Divider component="li" />

          {/* individual options */}
          {sectionTypes.map((section) => (
            <MenuItem
              key={section}
              value={section}
              onClick={() => {
                /* If all are selected, select only the clicked item */
                if (chosenSectionTypes.length === sectionTypes.length) {
                  setChosenSectionTypes([section]);
                } else {
                  setChosenSectionTypes((prev) => {
                    const newArray = [...prev];
                    const index = newArray.indexOf(section);
                    if (index > -1) {
                      newArray.splice(index, 1);
                    } else {
                      newArray.push(section);
                    }
                    return newArray;
                  });
                }
              }}
            >
              <Checkbox checked={chosenSectionTypes.includes(section)} />
              <ListItemText
                primary={displaySectionTypeName(section)}
                secondary={
                  ![selectAllSentinelValue, othersSentinalValue].includes(
                    section,
                  )
                    ? section
                    : undefined
                }
              />
            </MenuItem>
          ))}
        </MenuList>
      </FilterChip>
    </Tooltip>
  );
}
