import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Card,
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
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import SearchQuery, {
  convertToProfOnly,
} from '../../../modules/SearchQuery/SearchQuery';
import searchQueryLabel from '../../../modules/searchQueryLabel/searchQueryLabel';
import type { RateMyProfessorData } from '../../../pages/api/ratemyprofessorScraper';
import { BarGraph } from '../../graph/BarGraph/BarGraph';

function colorMidpoint(bad: number, good: number, value: number) {
  const min = good < bad ? good : bad;
  const max = good > bad ? good : bad;

  // Ensure value is within bounds
  if (value < min) value = min;
  if (value > max) value = max;

  // Normalize the value between 0 and 1
  let ratio = (value - min) / (max - min);
  if (good > bad) {
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

type GradesType = {
  session: number;
  grade_distribution: number[];
}[];

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
          <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
            <Typography className="text-base">5.0</Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          {typeof rmp !== 'undefined' && (
            <Box
              className="rounded-3xl px-5 py-2"
              sx={{ backgroundColor: colorMidpoint(5, 0, rmp.averageRating) }}
            >
              <Typography className="text-base">
                {typeof rmp === 'undefined'
                  ? 'X'
                  : rmp.averageRating.toFixed(1)}
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell align="right">
          {typeof rmp !== 'undefined' && (
            <Box
              className="rounded-3xl px-5 py-2 bg-primary-dark"
              sx={{
                backgroundColor: colorMidpoint(0, 5, rmp.averageDifficulty),
              }}
            >
              <Typography className="text-base">
                {rmp.averageDifficulty.toFixed(1)}
              </Typography>
            </Box>
          )}
        </TableCell>
      </TableRow>
      {/*<TableRow>
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
      </TableRow>*/}
    </>
  );
}

type SearchResultsTableProps = {
  includedResults: SearchQuery[];
  grades: { [key: string]: GradesType };
  rmp: { [key: string]: RateMyProfessorData };
};

/**
 * This component returns a bar that will allow users to add and remove search terms (up to 3 max)
 * using the SearchBar component. The currently selected search terms are represented by
 * SearchTermCard components, and are displayed from left to right in this grid.
 */
export const SearchResultsTable = ({
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
