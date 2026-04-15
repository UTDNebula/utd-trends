import {
  Checkbox,
  Divider,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';
import React, { type Dispatch, type SetStateAction } from 'react';
import FilterChip from '../FilterChip';

type SectionTypeFilterChipProps = {
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: Dispatch<SetStateAction<string[]>>;
};

function displaySectionTypeName(id: string): string {
  const SectionTypesMap: Record<string, string> = {
    '0xx': 'Normal day lecture',
    '0Wx': 'Online class',
    '0Hx': 'Hybrid day class (online + face-to-face)',
    '0Lx': 'LLC-only section',
    '5Hx': 'Hybrid night class (online + face-to-face)',
    '1xx': 'Lab section (sciences)',
    '2xx': 'Discussion section (humanities)',
    '3xx': 'Problem section (maths)',
    '5xx': 'Night lecture (past 5 PM)',
    '6xx': 'Lab night section (past 7 PM)',
    '7xx': 'Exam section',
    HNx: 'Honors-only',
    HON: 'Honors-only',
    xUx: 'Summer Class',
  };

  return SectionTypesMap[id] || id; // Default to ID if no mapping exists
}

export default function SectionTypeFilterChip({
  sectionTypes,
  chosenSectionTypes,
  setChosenSectionTypes,
}: SectionTypeFilterChipProps) {
  return (
    <Tooltip title="Section types to include grades from" placement="top">
      <FilterChip
        label="Section Types"
        renderValue={
          chosenSectionTypes.length > 0
            ? chosenSectionTypes.length === sectionTypes.length
              ? 'All'
              : chosenSectionTypes.sort().join(', ')
            : 'None'
        }
        dirty={chosenSectionTypes.length !== sectionTypes.length}
      >
        <MenuList className="*:pr-6">
          {/* select all section types */}
          <MenuItem
            className="h-10 items-center"
            value="select-all"
            onClick={() => {
              if (chosenSectionTypes.length === sectionTypes.length) {
                setChosenSectionTypes([]);
              } else {
                setChosenSectionTypes(sectionTypes);
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
              className="h-10 items-center"
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
              <ListItemText primary={displaySectionTypeName(section)} />
            </MenuItem>
          ))}
        </MenuList>
      </FilterChip>
    </Tooltip>
  );
}
