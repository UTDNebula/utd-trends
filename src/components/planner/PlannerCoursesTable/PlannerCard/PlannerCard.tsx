import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
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
import Link from 'next/link';
import React, { useState } from 'react';

import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
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
          <IconButton size="medium" disabled>
            <BarChartIcon />
          </IconButton>
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

  return [schedule, location, meeting.location.map_uri];
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
        {props.data.meetings
          .map(parseMeeting)
          .map(([schedule, location, link]) => (
            <>
              {schedule !== ' -' && (
                <Typography className="text-sm">{schedule}</Typography>
              )}
              {location !== ' ' && (
                <Typography className="text-sm">
                  {link === '' ? (
                    location
                  ) : (
                    <Link
                      href={link}
                      target="_blank"
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    >
                      {location}
                    </Link>
                  )}
                </Typography>
              )}
            </>
          ))}
      </TableCell>
    </TableRow>
  );
}

type PlannerCardProps = {
  query: SearchQuery;
  sections: SectionsData;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RMPInterface>;
  removeFromPlanner: () => void;
};

const PlannerCard = (props: PlannerCardProps) => {
  const [open, setOpen] = useState<'false' | 'sections' | 'grades'>('false');
  const canOpenSections = props.sections.length !== 0;
  const canOpenGrades =
    !(typeof props.grades === 'undefined' || props.grades.state === 'error') ||
    !(typeof props.rmp === 'undefined' || props.rmp.state === 'error');
  function handleOpen(from: 'row' | 'sections' | 'grades') {
    if (from === 'row' && open !== 'false') {
      setOpen('false');
    } else if (
      open !== 'sections' &&
      (from === 'sections' || from === 'row') &&
      canOpenSections
    ) {
      setOpen('sections');
    } else if (open !== 'grades' && from === 'grades' && canOpenGrades) {
      setOpen('grades');
    } else {
      setOpen('false');
    }
  }

  return (
    <Box
      component={Paper}
      className="border border-royal dark:border-cornflower-300 rounded-lg"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleOpen('row')} // opens/closes the card by clicking anywhere on the row
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleOpen('row');
          }
        }}
        className={
          'p-4 flex items-center gap-4' +
          (canOpenSections ? ' cursor-pointer' : '')
        }
      >
        <div className="flex items-center">
          <Tooltip
            title={open === 'sections' ? 'Minimize Result' : 'Expand Result'}
            placement="top"
          >
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={(e) => {
                e.stopPropagation(); // prevents double opening/closing
                handleOpen('sections');
              }}
              disabled={!canOpenSections}
              className={
                'transition-transform' +
                (open === 'sections' ? ' rotate-90' : '')
              }
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
          <Tooltip
            title={open === 'grades' ? 'Minimize Grades' : 'Expand Grades'}
            placement="top"
          >
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation(); // prevents double opening/closing
                handleOpen('grades');
              }}
              disabled={!canOpenGrades}
            >
              <BarChartIcon />
            </IconButton>
          </Tooltip>
        </div>
        <Typography className="leading-tight text-lg text-gray-500 dark:text-gray-200 w-fit">
          {searchQueryLabel(props.query)}
        </Typography>
      </div>
      {canOpenSections && (
        <Collapse in={open === 'sections'} timeout="auto" unmountOnExit>
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
      {canOpenGrades && (
        <Collapse in={open === 'grades'} timeout="auto" unmountOnExit>
          <div className="p-2 md:p-4 flex flex-col gap-2">
            <SingleGradesInfo
              course={props.query}
              grades={props.grades}
              gradesToUse="unfiltered"
            />
            <SingleProfInfo rmp={props.rmp} />
          </div>
        </Collapse>
      )}
    </Box>
  );
};

export default PlannerCard;
