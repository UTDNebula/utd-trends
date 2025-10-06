This component allows different courses to be compared with 3 different components: a CompareTable, a LineGraph, and a BarGraph. If the 'Add to Compare' button is clicked on search results, the course gets added to the 'Compare' tab on the right. Each component shows data from two or more search queries side-by-side.

### Compare Example

```jsx
// code is basically a combination of sample code from common/SingleGradesInfo and compare/CompareTable

import CloseIcon from '@mui/icons-material/Close';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Skeleton,
} from '@mui/material';
import React from 'react';
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import BarGraph from '@/components/graph/BarGraph/BarGraph';
import LineGraph from '@/components/graph/LineGraph/LineGraph';
import GraphToggle from '@/components/navigation/GraphToggle/GraphToggle';

// code from CompareTable
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

// end of code from CompareTable

// code from SingleGradesInfo
const sampleSeries = [
  {
    name: 'Sample Course',
    data: [],
  },
];
const barNode = (
  <BarGraph
    series={sampleSeries}
    yaxisFormatter={(value) => Number(value).toFixed(0).toLocaleString() + '%'}
    xaxisLabels={[
      'A+',
      'A',
      'A-',
      'B+',
      'B',
      'B-',
      'C+',
      'C',
      'C-',
      'D+',
      'D',
      'D-',
      'F',
      'W',
    ]}
    title="% of Students"
  ></BarGraph>
);
const lineNode = (
  <LineGraph title="GPA Trend" series={sampleSeries}></LineGraph>
);
// end of code from SingleGradesInfo

<>
  <div className="w-full py-5">
    {/* Code from SingleGradesInfo (only one line) */}
    <GraphToggle state="ready" bar={barNode} line={lineNode} />

    {/* Code from CompareTable */}
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
