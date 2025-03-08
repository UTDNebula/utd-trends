import BookMarkIcon from '@mui/icons-material/Bookmark';
import CollectionsBookMarkIcon from '@mui/icons-material/CollectionsBookmark';
import KeyboardArrowIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  Checkbox,
  Collapse,
  Grid2,
  IconButton,
  Item,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { SectionsData } from '@/pages/api/sections';

function ExpandedTableHead() {
  return (
    <TableRow
      sx={{
        width: '100%',
        height: '20px',
        '& .MuiTableCell-root': {
          padding: '8px', // Reduce cell padding
          height: '10px', // Ensure cells match row height
        },
      }}
      className="bg-[#9986e3]"
    >
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Add
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Class #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1 }}
        >
          Subject
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 1 }}
        >
          Course #
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1 }}
        >
          Section #
        </Typography>
      </TableCell>
      <TableCell sx={{ width: '30%' }}>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.70rem', color: 'white', lineHeight: 1, pl: 2 }}
        >
          Schedule & Location
        </Typography>
      </TableCell>
    </TableRow>
  );
}

type ExpandedTableRowsProps = {
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

function ExpandedTableRows({
  prefix,
  number,
  classNumber,
  section,
  meetingDays,
  startTime,
  endTime,
  location,
}: ExpandedTableRowsProps) {
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
        <Typography variant="body1">{classNumber}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">{prefix}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">{number}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1">{section}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body1" sx={{ fontSize: '0.90rem' }}>
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

  return (
    <Box
      sx={{
        width: 550,
        height: open
          ? 80 + (latestSections.length > 0 ? latestSections.length * 85 : 35)
          : 80,
        border: 2,
        borderRadius: 6,
        bgcolor: '#f9f9f9',
        borderColor: '#5f3fd3',
        display: 'flex',
        alignItems: 'center',

        overflow: 'hidden',
      }}
      onClick={() => setOpen(!open)}
    >
      <Grid2
        container
        spacing={1}
        alignItems="center"
        sx={{ width: '100%', pt: open ? 2 : 0 }}
      >
        <Grid2 sx={{ pl: 2 }}>
          <IconButton
            size="medium"
            sx={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <KeyboardArrowIcon fontSize="inherit" />
          </IconButton>
        </Grid2>

        <Grid2>
          <Checkbox
            defaultChecked
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkClick();
            }}
            icon={
              <BookMarkIcon style={{ color: '#553dff' }} fontSize="medium" />
            }
            checkedIcon={<BookMarkIcon fontSize="medium" />}
          />
        </Grid2>

        <Grid2>
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 cursor-text w-fit">
            {`${prefix} ${number} ${profFirst ? profFirst : ''} ${profLast ? profLast : ''} `}
          </Typography>
        </Grid2>

        <Collapse in={open} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ height: 15 }}>
                {latestSections.length !== 0 ? (
                  <ExpandedTableHead />
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
                      <ExpandedTableRows
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
      </Grid2>
    </Box>
  );
};

export default PlannerCard;
