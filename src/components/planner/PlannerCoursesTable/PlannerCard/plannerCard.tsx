import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import CollectionsBookMarkIcon from '@mui/icons-material/CollectionsBookmark';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Checkbox,
  Collapse,
  IconButton,
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

import { SectionsData } from '@/pages/api/sections';

function SectionTableHead() {
  return (
    <TableRow
      sx={{
        '& .MuiTableCell-root': {
          padding: '8px', // Reduce cell padding
        },
      }}
      className="bg-cornflower-600 p-2"
    >
      <TableCell>
        <Typography className="text-white text-xs text-center">Add</Typography>
      </TableCell>
      <TableCell>
        <Typography className="text-white text-xs text-center">
          Class #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className="text-white text-xs text-center">
          Subject
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className="text-white text-xs text-center">
          Course #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography className="text-white text-xs text-center">
          Section #
        </Typography>
      </TableCell>
      <TableCell sx={{ width: '30%' }}>
        <Typography className="text-white text-xs text-center">
          Schedule & Location
        </Typography>
      </TableCell>
    </TableRow>
  );
}

type SectionTableRowProps = {
  prefix: string;
  number: string;
  classNumber: string;
  section: string;
  meetingDays: string[];
  startTime: string;
  endTime: string;
  location: {
    building: string;
    room: string;
  };
};

function SectionTableRows({
  prefix,
  number,
  classNumber,
  section,
  meetingDays,
  startTime,
  endTime,
  location,
}: SectionTableRowProps) {
  console.log(
    `prefix ${prefix} number ${number} classNumber ${classNumber} section ${section} meetingDays ${meetingDays} startTime ${startTime} endTime ${endTime} location ${location}`,
  );
  function daySlice(day: string): string {
    if (day.slice(0, 1) === 'S') {
      return day.slice(0, 2);
    }

    if (day.slice(0, 2) === 'Th') {
      return day.slice(0, 2);
    }

    return day.slice(0, 1);
  }

  function classTime(startTime: string, endTime: string): string {
    const meridian = startTime.slice(-2);

    return `${startTime.replace(meridian, '')}-${endTime}`;
  }

  let days: string = '';
  const time: string = classTime(startTime, endTime);
  meetingDays.forEach((day) => {
    days += daySlice(day);
  });

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          onClick={(e) => {
            e.stopPropagation();
          }}
          icon={<CollectionsBookMarkIcon fontSize="medium" />}
          checkedIcon={<CollectionsBookMarkIcon fontSize="medium" />}
        />
      </TableCell>
      <TableCell>
        <Typography>{classNumber}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{prefix}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{number}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{section}</Typography>
      </TableCell>
      <TableCell>
        <Typography className="text-sm">
          {days} {time} <br />
          {location.building} {location.room}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

type PlannerCardProps = {
  prefix: string;
  number: string;
  profFirst: string;
  profLast: string;
  numSections: number;
  onBookmarkClick: () => void;
  latestSections: SectionsData[];
};

const PlannerCard = ({
  prefix,
  number,
  profFirst,
  profLast,
  numSections,
  onBookmarkClick,
  latestSections,
}: PlannerCardProps) => {
  const [open, setOpen] = useState(false);
  console.log(
    `${prefix} ${number} ${profFirst} ${profLast}`,
    `${numSections} sections`,
  );

  return (
    <>
      <TableRow
        onClick={() => setOpen(!open)} // opens/closes the card by clicking anywhere on the row
        className="cursor-pointer"
      >
        <TableCell className="border-b-0">
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
                  onBookmarkClick();
                }}
                icon={<BookOutlinedIcon />}
                checkedIcon={<BookIcon />}
              />
            </Tooltip>
          </div>
        </TableCell>
        <TableCell className="border-b-0">
          <Typography className="leading-tight text-lg text-gray-500 dark:text-gray-200 w-fit">
            {`${prefix} ${number} ${profFirst ? profFirst : ''} ${profLast ? profLast : ''} `}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="p-0" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TableContainer>
              <Table>
                <TableHead>
                  {latestSections.length !== 0 ? (
                    <SectionTableHead />
                  ) : (
                    <Typography sx={{ textAlign: 'center' }}>
                      No Upcoming Sections
                    </Typography>
                  )}
                </TableHead>
                <TableBody>
                  {latestSections.map((section, index) => {
                    if (latestSections.length !== 0) {
                      return (
                        <SectionTableRows
                          key={index}
                          prefix={prefix}
                          number={number}
                          classNumber={section.internal_class_number}
                          section={section.section_number}
                          meetingDays={section.meetings[0].meeting_days}
                          startTime={section.meetings[0].start_time}
                          endTime={section.meetings[0].end_time}
                          location={section.meetings[0].location}
                        />
                      );
                    }
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default PlannerCard;
