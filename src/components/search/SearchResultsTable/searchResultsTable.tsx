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

import Rating from '@/components/common/Rating/rating';
import SingleGradesInfo from '@/components/common/SingleGradesInfo/singleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/singleProfInfo';
import TableSortLabel from '@/components/common/TableSortLabel/tableSortLabel';
import { useRainbowColors } from '@/modules/colors/colors';
import gpaToLetterGrade from '@/modules/gpaToLetterGrade/gpaToLetterGrade';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData, GradesType } from '@/pages/dashboard/index';

interface RowProps {
  course: SearchQuery;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RMPInterface>;
  inCompare: boolean;
  addToCompare: (arg0: SearchQuery) => void;
  removeFromCompare: (arg0: SearchQuery) => void;
  color?: string;
}

function Row({
  course,
  grades,
  rmp,
  inCompare,
  addToCompare,
  removeFromCompare,
  color,
}: RowProps) {
  const [open, setOpen] = useState(false);
  const rainbowColors = useRainbowColors();

  const gpaToColor = (gpa: number): string => {
    if (gpa >= 4.0) return rainbowColors[1];
    if (gpa >= 3.67) return rainbowColors[2];
    if (gpa >= 3.33) return rainbowColors[3];
    if (gpa >= 3.0) return rainbowColors[4];
    if (gpa >= 2.67) return rainbowColors[5];
    if (gpa >= 2.33) return rainbowColors[6];
    if (gpa >= 2.0) return rainbowColors[7];
    if (gpa >= 1.67) return rainbowColors[8];
    if (gpa >= 1.33) return rainbowColors[9];
    if (gpa >= 1.0) return rainbowColors[10];
    if (gpa >= 0.67) return rainbowColors[11];
    return rainbowColors[12];
  };

  return (
    <>
      <TableRow className="cursor-pointer w-full" onClick={() => setOpen(!open)}>
        <TableCell className="border-b-0 px-2 py-1">
          <div className="flex items-center gap-1">
            <Tooltip title={open ? 'Minimize Result' : 'Expand Result'}>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
                className={'transition-transform' + (open ? ' rotate-90' : '')}
              >
                <KeyboardArrowIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title={inCompare ? 'Remove from Compare' : 'Add to Compare'}>
              <Checkbox
                checked={inCompare}
                onClick={(e) => {
                  e.stopPropagation();
                  if (inCompare) {
                    removeFromCompare(course);
                  } else {
                    addToCompare(course);
                  }
                }}
                disabled={grades?.state === 'loading' || rmp?.state === 'loading'}
                sx={color ? { '&.Mui-checked': { color } } : undefined}
              />
            </Tooltip>
          </div>
        </TableCell>
        <TableCell className="border-b-0 px-2 py-1 w-full">
          <Tooltip
            title={
              rmp?.state === 'done' && rmp.data.teacherRatingTags.length > 0
                ? 'Tags: ' + rmp.data.teacherRatingTags.map((tag) => tag.tagName).join(', ')
                : 'No Tags Available'
            }
          >
            <Typography
              className="text-xs text-gray-600 dark:text-gray-200 cursor-text w-full break-words"
            >
              {searchQueryLabel(course)}
            </Typography>
          </Tooltip>
        </TableCell>
        <TableCell align="center" className="border-b-0 px-2 py-1">
          {grades?.state === 'loading' ? (
            <Skeleton variant="rounded" className="rounded-full w-full px-1 py-1 mx-auto" />
          ) : grades?.state === 'done' ? (
            <Tooltip title={'GPA: ' + grades.data.gpa.toFixed(2)}>
              <Typography
                className="text-xs text-center px-2 py-1 rounded-full mx-auto"
                sx={{ backgroundColor: gpaToColor(grades.data.gpa), fontSize: '0.75rem' }}
              >
                {gpaToLetterGrade(grades.data.gpa)}
              </Typography>
            </Tooltip>
          ) : null}
        </TableCell>
        <TableCell align="center" className="border-b-0 px-2 py-1">
          {rmp?.state === 'done' && rmp.data.numRatings !== 0 && (
            <Tooltip title={'Professor rating: ' + rmp.data.avgRating}>
              <div>
                <Rating defaultValue={rmp.data.avgRating} precision={0.1} sx={{ fontSize: 14 }} readOnly />
              </div>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div className="p-2 flex flex-col gap-2 w-full">
              <SingleGradesInfo course={course} grades={grades} />
              <SingleProfInfo rmp={rmp} />
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
