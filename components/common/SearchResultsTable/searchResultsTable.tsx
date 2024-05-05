import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';

import { BarGraph } from '../../graph/BarGraph/BarGraph';

type fullGradesType = {
  name: string;
  data: {
    session: number;
    grade_distribution: number[];
  }[];
};

type profType = {
  found: boolean;
  data: {
    averageRating: number;
    averageDifficulty: number;
    department: string;
    firstName: string;
    lastName: string;
    legacyId: string;
    numRatings: number;
    wouldTakeAgainPercentage: number;
  };
};

type gradesType = {
  name: string;
  data: number[];
};

function createCourse(
  courseData: fullGradesType,
  averageData: number,
  studentTotals: number,
  professorData: profType,
  distributionData: gradesType,
) {
  const x: gradesType = { name: 'x', data: [] };
  return {
    name: courseData.name,
    gpa:
      averageData === undefined || Number.isNaN(averageData) ? -1 : averageData,
    num_students: studentTotals,
    rmp_rating:
      professorData !== undefined && professorData.found
        ? professorData.data.averageRating
        : -1,
    difficulty:
      professorData !== undefined && professorData.found
        ? professorData.data.averageDifficulty
        : -1,
    would_take_again:
      professorData !== undefined && professorData.found
        ? professorData.data.wouldTakeAgainPercentage
        : -1,
    num_rmp_ratings:
      professorData !== undefined && professorData.found
        ? professorData.data.numRatings
        : -1,
    grade_distribution:
      distributionData !== undefined
        ? distributionData
        : { name: '', data: [] },
    history: [
      // expanded info
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

function Row(props: { row: ReturnType<typeof createCourse> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {row.name}
          </Typography>
          <Typography className="block text-sm text-gray-500 dark:text-gray-300 inline">
            course name
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
            <Typography className="text-base">
              {row.gpa === -1 ? 'X' : row.gpa.toFixed(2)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
            <Typography className="text-base">
              {row.rmp_rating === -1 ? 'X' : row.rmp_rating.toFixed(1)}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
            <Typography className="text-base">
              {row.difficulty === -1 ? 'X' : row.difficulty.toFixed(1)}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <div className="h-full m-4">
                <Card className="h-96 p-4 m-4">
                  <BarGraph
                    title="Grades"
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
                    yaxisFormatter={(value) => Number(value).toFixed(0) + '%'}
                    series={[row.grade_distribution]}
                  />
                </Card>
                <div className="flex flex-wrap justify-around">
                  <p>
                    Grades: <b>{row.num_students}</b>
                  </p>
                  <p>
                    GPA: <b>{row.gpa === -1 ? 'X' : row.gpa.toFixed(3)}</b>
                  </p>
                </div>
                <div className="inline-flex">
                  <Box className="bg-gray-200 dark:bg-gray-800 rounded px-2">
                    <p># of RMP ratings </p>
                    <p className="flex justify-center">
                      {row.num_rmp_ratings === -1 ? 'X' : row.num_rmp_ratings}
                    </p>
                  </Box>
                  <Box className="mx-3 bg-gray-200 dark:bg-gray-800 rounded px-2">
                    <p>would take again</p>
                    <p className="flex justify-center">
                      {row.would_take_again === -1
                        ? 'X'
                        : row.would_take_again.toFixed(0) + '%'}
                    </p>
                  </Box>
                </div>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

type SearchResultsTableProps = {
  courseResults: fullGradesType[]; //TODO: create a courseType that encompasses grades, rmp, etc
  averageData: number[];
  studentTotals: number[];
  professorData: profType[];
  distributionData: gradesType[];
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const SearchResultsTable = ({
  courseResults,
  averageData,
  studentTotals,
  professorData,
  distributionData,
}: SearchResultsTableProps) => {
  // console.log('in searchResultsTable');
  // console.log(courseResults);
  // console.log(averageData);
  // console.log(studentTotals);
  // console.log(professorData);
  // console.log(distributionData);

  //Convert NaN's to -1 -- if a course has no GPA, treat it as -1 (for sorting)
  averageData.map((gpa) => (Number.isNaN(gpa) ? -1 : gpa));
  console.log(averageData);

  return (
    //TODO: sticky header
    <div className="grid grid-flow-column auto-cols-fr justify-center">
      <div className="p-4 rounded-none">
        <Typography className="leading-tight text-lg text-dark">
          Search Results
        </Typography>
      </div>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align="right">GPA</TableCell>
              <TableCell align="right">Rating</TableCell>
              <TableCell align="right">Difficulty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseResults
              .map((courseResult, index) =>
                createCourse(
                  courseResult,
                  averageData[index],
                  studentTotals[index],
                  professorData[index],
                  distributionData[index],
                ),
              )
              .map((row) => (
                <Row key={row.name} row={row} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
