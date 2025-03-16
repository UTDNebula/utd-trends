import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Rating from '@/components/common/Rating/Rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/TableSortLabel';
import { gpaToColor, useRainbowColors } from '@/modules/colors/colors';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade/gpaToLetterGrade';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';

const Row = ({ course, grades, rmp, inCompare, addToCompare, removeFromCompare, color }) => {
  const [open, setOpen] = useState(false);
  const rainbowColors = useRainbowColors();
  const canOpen = grades?.state !== 'error' || rmp?.state !== 'error';

  return (
    <>
      <TableRow className={`cursor-pointer ${canOpen ? '' : 'opacity-50'}`} onClick={() => canOpen && setOpen(!open)}>
        <TableCell className="p-1 flex items-center">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            <KeyboardArrowIcon fontSize="small" className={open ? 'rotate-90' : ''} />
          </IconButton>
          <Checkbox size="small" checked={inCompare} onClick={(e) => { e.stopPropagation(); inCompare ? removeFromCompare(course) : addToCompare(course); }} />
        </TableCell>
        <TableCell className="text-xs">
          <Tooltip title={rmp?.state === 'done' ? rmp.data.teacherRatingTags.map(tag => tag.tagName).join(', ') : 'No Tags Available'}>
            <Typography className="w-full truncate">{searchQueryLabel(course)}</Typography>
          </Tooltip>
        </TableCell>
        <TableCell align="center" className="text-xs p-1">
          {grades?.state === 'done' ? (
            <Tooltip title={`GPA: ${grades.data.filtered.gpa.toFixed(2)}`}>
              <Typography className="text-xs rounded px-2" style={{ backgroundColor: gpaToColor(rainbowColors, grades.data.filtered.gpa) }}>
                {gpaToLetterGrade(grades.data.filtered.gpa)}
              </Typography>
            </Tooltip>
          ) : <Skeleton width={30} height={20} />}
        </TableCell>
        <TableCell align="center" className="text-xs p-1">
          {rmp?.state === 'done' && rmp.data.numRatings ? (
            <Tooltip title={`Professor rating: ${rmp.data.avgRating}`}>
              <Rating defaultValue={rmp.data.avgRating} precision={0.1} readOnly sx={{ fontSize: 14 }} />
            </Tooltip>
          ) : <Skeleton width={20} height={20} />}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 grid grid-cols-2 gap-2">
              <SingleGradesInfo course={course} grades={grades} />
              <SingleProfInfo rmp={rmp} />
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const SearchResultsTable = ({ resultsLoading, includedResults, grades, rmp, compare, addToCompare, removeFromCompare, colorMap }) => {
  return (
    <div className="w-full overflow-x-auto">
      <Typography className="text-lg font-bold p-2">Search Results</Typography>
      <TableContainer component={Paper} className="w-full max-w-full">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className="p-1 text-xs">Actions</TableCell>
              <TableCell className="p-1 text-xs">Name</TableCell>
              <TableCell align="center" className="p-1 text-xs">Grades</TableCell>
              <TableCell align="center" className="p-1 text-xs">Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resultsLoading === 'done' ? (
              includedResults.map((result) => (
                <Row
                  key={searchQueryLabel(result)}
                  course={result}
                  grades={grades[searchQueryLabel(result)]}
                  rmp={rmp[searchQueryLabel(convertToProfOnly(result))]}
                  inCompare={compare.some(obj => searchQueryEqual(obj, result))}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  color={colorMap[searchQueryLabel(result)]}
                />
              ))
            ) : (
              Array(10).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton height={30} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SearchResultsTable;