import { Close, Help, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import React from 'react';

/**
 * Props type used by the ResultRow component
 */
type ResultRowProps = {
  courseCode: string;
  courseName: string;
  gpa: number;
  rmpRating: number;
  rmpDifficulty: number;
  includeTooltip: boolean;
  index: number;
  onAddToCompare: (index: number) => void;
  onToggleClick: (index: number) => void;
};

/**
 * This component returns a custom Card that shows the search result with GPA, RMP Rating, and RMP Difficulty data
 * The Result can be added to compare
 */
export const ResultRow = (props: ResultRowProps) => {
  function handleToggleClick() {
    props.onToggleClick(props.index);
  }

  function handleAddToCompare() {
    props.onAddToCompare(props.index);
  }

  return (
    <Card className="bg-primary-light p-2 flex flex-row justify-between items-center rounded-none group">
      <Box style={{ width: '124px' }}>
        <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200">
          {props.courseCode}
        </Typography>
        <Typography className="block text-sm text-gray-500 dark:text-gray-300 inline">
          {props.courseName}
        </Typography>
      </Box>
      <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
        <Typography className="text-base">{props.gpa}</Typography>
      </Box>
      <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
        <Typography className="text-base">{props.rmpRating}</Typography>
      </Box>
      <Box className="rounded-3xl px-5 py-2 bg-primary-dark">
        <Typography className="text-base">{props.rmpDifficulty}</Typography>
      </Box>
    </Card>
  );
};
