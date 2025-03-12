import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import GradeIcon from '@mui/icons-material/Grade';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Paper,
  Radio,
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

import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import { type SectionsData } from '@/pages/api/sections';

export function LoadingRow() {
  return (
    <Box
      component={Paper}
      className="border border-royal dark:border-cornflower-300 rounded-lg"
    >
      <div className="p-4 flex items-center gap-4">
        <div className="flex items-center">
          <IconButton aria-label="expand row" size="medium" disabled>
            <KeyboardArrowIcon />
          </IconButton>
          <Checkbox checked={true} checkedIcon={<BookIcon />} disabled />
        </div>
        <Typography className="w-1/2 leading-tight text-lg">
          <Skeleton />
        </Typography>
      </div>
    </Box>
  );
}

function SectionTableHead() {
  return (
    <TableRow className="bg-cornflower-600">
      <TableCell className="py-2 px-4 border-b-0" align="left">
        <Typography className="text-white text-xs">Select</Typography>
      </TableCell>
      <TableCell className="py-2 px-4 border-b-0">
        <Typography className="text-white text-xs">Section #</Typography>
      </TableCell>
      <TableCell className="py-2 px-4 border-b-0">
        <Typography className="text-white text-xs">Class #</Typography>
      </TableCell>
      <TableCell className="py-2 px-4 border-b-0">
        <Typography className="text-white text-xs">
          Schedule & Location
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function parseMeeting(meeting: SectionsData[number]['meetings'][number]) {
  function daySlice(day: string): string {
    if (day.slice(0, 1) === 'S') {
      return day.slice(0, 2);
    }

    if (day.slice(0, 2) === 'Th') {
      return day.slice(0, 2);
    }

    return day.slice(0, 1);
  }
  let days: string = '';
  meeting.meeting_days.forEach((day) => {
    days += daySlice(day);
  });

  function classTime(startTime: string, endTime: string): string {
    const startAmPm = startTime.slice(-2);
    const endAmPm = endTime.slice(-2);
    if (startAmPm !== endAmPm) {
      return `${startTime}-${endTime}`;
    }
    return `${startTime.slice(0, -2)}-${endTime}`;
  }
  const time = classTime(meeting.start_time, meeting.end_time);

  const schedule = `${days} ${time}`;
  const location = `${meeting.location.building} ${meeting.location.room}`;

  return [schedule, location];
}

type SectionTableRowProps = {
  data: SectionsData[number];
  lastRow: boolean;
};

function SectionTableRows(props: SectionTableRowProps) {
  return (
    <TableRow>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        <Radio
          onClick={() => {
            console.log('clicked');
          }}
        />
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        <Typography>{props.data.section_number}</Typography>
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        <Typography>{props.data.internal_class_number}</Typography>
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        {props.data.meetings.map(parseMeeting).map(([schedule, location]) => (
          <>
            <Typography className="text-sm">{schedule}</Typography>
            <Typography className="text-sm">{location}</Typography>
          </>
        ))}
      </TableCell>
    </TableRow>
  );
}

type PlannerCardProps = {
  query: SearchQuery;
  sections: SectionsData;
  removeFromPlanner: () => void;
};

const PlannerCard = (props: PlannerCardProps) => {
  const [open, setOpen] = useState(false);
  const canOpen = props.sections.length !== 0;

  return (
    <Box
      component={Paper}
      className="border border-royal dark:border-cornflower-300 rounded-lg"
    >
      <div
        onClick={() => {
          if (canOpen) setOpen(!open);
        }} // opens/closes the card by clicking anywhere on the row
        className={
          'p-4 flex items-center gap-4' + (canOpen ? ' cursor-pointer' : '')
        }
      >
        <div className="flex items-center">
          <Tooltip
            title={open ? 'Minimize Result' : 'Expand Result'}
            placement="top"
          >
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={(e) => {
                e.stopPropagation(); // prevents double opening/closing
                setOpen(!open);
              }}
              disabled={!canOpen}
              className={'transition-transform' + (open ? ' rotate-90' : '')}
            >
              <KeyboardArrowIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Remove from Planner'} placement="top">
            <Checkbox
              checked={true /*inPlanner?*/}
              onClick={(e) => {
                e.stopPropagation();
                props.removeFromPlanner();
              }}
              icon={<BookOutlinedIcon />}
              checkedIcon={<BookIcon />}
            />
          </Tooltip>
          <Tooltip title={'Remove from Planner'} placement="top">
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation(); // prevents double opening/closing
                setOpen(!open);
              }}
              disabled={!canOpen}
            >
              <GradeIcon />
            </IconButton>
          </Tooltip>
        </div>
        <Typography className="leading-tight text-lg text-gray-500 dark:text-gray-200 w-fit">
          {searchQueryLabel(props.query)}
        </Typography>
      </div>
      {props.sections.length !== 0 && (
        <Collapse in={open}>
          <TableContainer className="rounded-t-none">
            <Table>
              <TableHead>
                <SectionTableHead />
              </TableHead>
              <TableBody>
                {props.sections.map((section, index) => (
                  <SectionTableRows
                    key={index}
                    data={section}
                    lastRow={index === props.sections.length - 1}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      )}
    </Box>
  );
};

export default PlannerCard;
