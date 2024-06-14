import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import SearchQuery, {
  convertToProfOnly,
} from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import { GradesType } from '../../../pages/dashboard/index';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

function colorMidpoint(good: number, bad: number, value: number) {
  const min = bad < good ? bad : good;
  const max = bad > good ? bad : good;

  // Ensure value is within bounds
  if (value < min) value = min;
  if (value > max) value = max;

  // Normalize the value between 0 and 1
  let ratio = (value - min) / (max - min);
  if (bad > good) {
    ratio = 1 - ratio;
  }

  const startColor = { r: 0xff, g: 0x57, b: 0x57 };
  const endColor = { r: 0x79, g: 0xff, b: 0x57 };

  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

type RowProps = {
  course: SearchQuery;
  grades: GradesType;
  rmp: RateMyProfessorData;
};

function Row({ course, grades, rmp }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            className={'transition-transform' + (open ? ' rotate-90' : '')}
          >
            <KeyboardArrowIcon />
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
            {searchQueryLabel(course)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          {typeof grades !== 'undefined' && grades.gpa !== -1 ? (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(4, 0, grades.gpa) }}
            >
              {grades.gpa.toFixed(2)}
            </Typography>
          ) : (
            <Typography className="text-base px-5 py-2 inline">X</Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {typeof rmp !== 'undefined' ? (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{ backgroundColor: colorMidpoint(5, 0, rmp.averageRating) }}
            >
              {rmp.averageRating.toFixed(1)}
            </Typography>
          ) : (
            <Typography className="text-base px-5 py-2 inline">X</Typography>
          )}
        </TableCell>
        <TableCell align="right">
          {typeof rmp !== 'undefined' ? (
            <Typography
              className="text-base text-black rounded-3xl px-5 py-2 inline"
              sx={{
                backgroundColor: colorMidpoint(0, 5, rmp.averageDifficulty),
              }}
            >
              {rmp.averageDifficulty.toFixed(1)}
            </Typography>
          ) : (
            <Typography className="text-base px-5 py-2 inline">X</Typography>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-4">
              {typeof grades !== 'undefined' && (
                <>
                  <div className="h-64">
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
                      series={[
                        {
                          name: searchQueryLabel(course),
                          data: grades.grade_distribution,
                        },
                      ]}
                    />
                  </div>
                  <div className="flex flex-wrap justify-around">
                    <p>
                      Grades: <b>{grades.total}</b>
                    </p>
                    <p>
                      GPA:{' '}
                      <b>{grades.gpa === -1 ? 'X' : grades.gpa.toFixed(3)}</b>
                    </p>
                  </div>
                </>
              )}
              {typeof rmp !== 'undefined' && (
                <>
                  <div className="inline-flex">
                    <Box className="bg-gray-200 dark:bg-gray-800 rounded px-2">
                      <p># of RMP ratings </p>
                      <p className="flex justify-center">
                        {rmp.numRatings === -1 ? 'X' : rmp.numRatings}
                      </p>
                    </Box>
                    <Box className="mx-3 bg-gray-200 dark:bg-gray-800 rounded px-2">
                      <p>would take again</p>
                      <p className="flex justify-center">
                        {rmp.wouldTakeAgainPercentage === -1
                          ? 'X'
                          : rmp.wouldTakeAgainPercentage.toFixed(0) + '%'}
                      </p>
                    </Box>
                  </div>
                </>
              )}
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

type SearchResultsTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
};

const SearchResultsTable = ({
  includedResults,
  grades,
  rmp,
}: SearchResultsTableProps) => {
  return (
    //TODO: sticky header
    <>
      <Typography className="leading-tight text-3xl font-bold p-4">
        Search Results
      </Typography>
      <TableContainer component={Paper}>
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align="center">GPA</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Difficulty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {includedResults.map((result) => (
              <Row
                key={searchQueryLabel(result)}
                course={result}
                grades={grades[searchQueryLabel(result)]}
                rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SearchResultsTable;
