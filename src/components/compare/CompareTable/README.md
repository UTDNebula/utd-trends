This component shows a comparison between different courses. It is part of the Compare component and compares one or more courses based on average GPA, professor rating, percentage of students who would take the professor again, and the difficulty of the professor. It also allows the order of the courses to change (can be ordered based on the 4 categories listed above in either ascending or descending order). Courses can also be removed by de-selecting the checkbox.

### Props Table

| Prop                | Type                                        | Description                                                                           | Required |
| :------------------ | :------------------------------------------ | :------------------------------------------------------------------------------------ | -------- |
| `includedResults`   | `SearchQuery[]`                             | The search queries that are used for comparing (for ex. 'GOVT 2306' or 'Euel Elliot') | Yes      |
| `grades`            | `[key: string]: GenericFetchedData<Grades>` | A mapping of grade data for each search query                                         | Yes      |
| `rmp`               | `[key: string]: GenericFetchedData<RMP>`    | A mapping of RateMyProfessor data for each search query                               | Yes      |
| `removeFromCompare` | `function with (arg0: SearchQuery)`         | Defines the function for removing a search query from the compare section             | Yes      |
| `colorMap`          | `[key: string]: string`                     | A mapping of a color to each course for comparison purposes                           | Yes      |

### CompareTable Example

```jsx
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import CloseIcon from '@mui/icons-material/Close';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';

const SampleProps = {
  name: [
    'GPA',
    'Rating',
    'Would Take Again',
    'Difficulty',
    '# of Grades / Ratings',
    'Color',
  ],
  colors: ['#0e60e6', '#e60e2e'],
};

// Makes a colored rectangle that holds all the data for a SearchQuery
function RowStart(props) {
  return (
    <>
      <TableCell
        key={props.title}
        className="text-center py-3 border-x-2 border-t-2 rounded-t-lg w-min"
        sx={{ borderBottom: 'none' }}
        style={{
          borderColor: props.color,
          backgroundColor: props.color + '10', // add transparency
        }}
      >
        {props.title}
      </TableCell>
    </>
  );
}

// Shows the categories to the left and finishes the border for each SearchQuery
function GradeOrRmpRow(props) {
  return (
    <>
      <TableRow sx={{ '& td': { border: 0 } }}>
        <TableCell align="right" className="pl-0">
          <TableSortLabel
            active={true}
            direction={'asc'}
            sx={
              props.title == '# of Grades / Ratings'
                ? { '& .MuiTableSortLabel-icon': { display: 'none' } }
                : props.title == 'Difficulty'
                  ? {
                      '& .MuiTableSortLabel-icon': { rotate: '90deg' },
                    }
                  : {
                      '& .MuiTableSortLabel-icon': { rotate: '-90deg' },
                    }
            }
          >
            {
              <Tooltip
                title={props.title}
                placement="left"
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 10], // Adjust these values as needed
                      },
                    },
                  ],
                }}
              >
                <span>{props.title}</span>
              </Tooltip>
            }
          </TableSortLabel>
        </TableCell>
        {SampleProps.colors.map((c, idx) => (
          <TableCell
            key={idx}
            className={
              props.title != 'Color'
                ? 'py-3 border-x-2'
                : 'pt-0 pb-1 border-x-2 border-b-2 rounded-b-lg'
            }
            style={{
              borderColor: c,
              backgroundColor: c + '10', // small transparency
            }}
          />
        ))}
      </TableRow>
    </>
  );
}

<>
  {/* Shows a sample with 2 classes */}
  <div className="w-full py-5">
    <TableContainer className="w-fit h-full mb-4">
      <Table size="small" className="border-spacing-x-2 border-separate">
        <TableHead>
          <TableRow>
            <TableCell
              className="font-bold px-0 text-center"
              sx={{ borderBottom: 'none' }}
            >
              Compare
            </TableCell>
            <RowStart title="Sample Class #1" color={SampleProps.colors[0]} />
            <RowStart title="Sample Class #2" color={SampleProps.colors[1]} />
          </TableRow>
        </TableHead>
        <TableBody>
          {SampleProps.name.map((col) => (
            <GradeOrRmpRow title={col} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
</>;
```
