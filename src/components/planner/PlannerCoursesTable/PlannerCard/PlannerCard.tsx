import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import EventIcon from '@mui/icons-material/Event';
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import { type SectionsData } from '@/pages/api/sections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { GradesType } from '@/types/GradesType';
import {
  removeSection,
  type SearchQuery,
  searchQueryLabel,
  type SearchQueryMultiSection,
  sectionCanOverlap,
} from '@/types/SearchQuery';

function parseTime(time: string): number {
  const [hour, minute] = time.split(':').map((s) => parseInt(s));
  const isPM = time.includes('pm');
  let hourNum = hour;
  if (isPM && hour !== 12) {
    hourNum += 12;
  } else if (!isPM && hour === 12) {
    hourNum = 0; // Midnight case
  }
  return hourNum + minute / 60;
}

function hasConflict(
  newSection: SectionsData[number],
  selectedSections: SectionsData,
): boolean {
  if (!newSection || !selectedSections) return false;

  for (const selectedSection of selectedSections) {
    for (const newMeeting of newSection.meetings) {
      if (!newMeeting || !newMeeting.meeting_days) continue;

      for (const existingMeeting of selectedSection.meetings) {
        if (!existingMeeting || !existingMeeting.meeting_days) continue;

        // Check if days overlap
        const overlappingDays = newMeeting.meeting_days.some((day) =>
          existingMeeting.meeting_days.includes(day),
        );

        if (overlappingDays) {
          // Convert times to comparable values
          const newStart = parseTime(newMeeting.start_time);
          const newEnd = parseTime(newMeeting.end_time);
          const existingStart = parseTime(existingMeeting.start_time);
          const existingEnd = parseTime(existingMeeting.end_time);

          // Check if times overlap
          if (
            (newStart < existingEnd && newStart >= existingStart) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd) ||
            (newStart >= existingStart && newEnd <= existingEnd)
          ) {
            return true; // Conflict detected
          }
        }
      }
    }
  }

  return false;
}

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
          <ToggleButtonGroup
            size="small"
            aria-label="dropdown switch"
            className="ml-2"
          >
            <ToggleButton value="" aria-label="sections" disabled>
              <EventIcon />
            </ToggleButton>
            <ToggleButton value="" aria-label="grades and rmp" disabled>
              <BarChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <Typography className="w-1/2 leading-tight text-lg">
          <Skeleton />
        </Typography>
      </div>
    </Box>
  );
}

function SectionTableHead(props: { hasMultipleDateRanges: boolean }) {
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
      {props.hasMultipleDateRanges && (
        <TableCell className="py-2 px-4 border-b-0">
          <Typography className="text-white text-xs">Date Range</Typography>
        </TableCell>
      )}
      <TableCell className="py-2 px-4 border-b-0">
        <Typography className="text-white text-xs">Syllabus</Typography>
      </TableCell>
    </TableRow>
  );
}

function parseDateRange(meeting: SectionsData[number]['meetings'][number]) {
  const start_date = new Date(meeting.start_date);
  const formatted_start = `${(start_date.getMonth() + 1).toString()}/${start_date.getDate().toString()}`;
  const end_date = new Date(meeting.end_date);
  const formatted_end = `${(end_date.getMonth() + 1).toString()}/${end_date.getDate().toString()}`;

  return [formatted_start, formatted_end];
}

function meetingDays(days: string[]): string {
  function daySlice(day: string): string {
    if (day.slice(0, 1) === 'S') {
      return day.slice(0, 2);
    }

    if (day.slice(0, 2) === 'Th') {
      return day.slice(0, 2);
    }

    return day.slice(0, 1);
  }
  let result: string = '';
  days.forEach((day) => {
    result += daySlice(day);
  });
  return result;
}

function parseMeeting(meeting: SectionsData[number]['meetings'][number]) {
  function classTime(startTime: string, endTime: string): string {
    const startAmPm = startTime.slice(-2);
    const endAmPm = endTime.slice(-2);
    if (startAmPm !== endAmPm) {
      return `${startTime}-${endTime}`;
    }
    return `${startTime.slice(0, -2)}-${endTime}`;
  }
  const time = classTime(meeting.start_time, meeting.end_time);

  const schedule = `${meetingDays(meeting.meeting_days)} ${time}`;
  const location = `${meeting.location.building} ${meeting.location.room}`;

  return [schedule, location, meeting.location.map_uri];
}

type SectionTableRowProps = {
  data: SectionsData[number];
  course: SearchQueryMultiSection;
  lastRow: boolean;
  setPlannerSection: (searchQuery: SearchQuery, section: string) => boolean;
  hasMultipleDateRanges: boolean;
  selectedSections: SectionsData;
  openConflictMessage: () => void;
};

function SectionTableRow(props: SectionTableRowProps) {
  const isSelected =
    props.course.sectionNumbers?.includes(props.data.section_number) ?? false;

  return (
    <TableRow>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        {sectionCanOverlap(props.data.section_number) ? (
          <Checkbox
            checked={isSelected}
            onClick={() => {
              if (
                !isSelected &&
                hasConflict(props.data, props.selectedSections)
              ) {
                // Check for conflict
                props.openConflictMessage();
                return; // Prevent section selection
              }
              props.setPlannerSection(props.course, props.data.section_number);
            }}
          />
        ) : (
          <Radio
            checked={isSelected}
            onClick={() => {
              if (
                !isSelected &&
                hasConflict(props.data, props.selectedSections)
              ) {
                // Check for conflict
                props.openConflictMessage();
                return; // Prevent section selection
              }
              props.setPlannerSection(props.course, props.data.section_number);
            }}
          />
        )}
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        <Typography className="text-sm">{props.data.section_number}</Typography>
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        <Typography className="text-sm">
          {props.data.internal_class_number}
        </Typography>
      </TableCell>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        {props.data.meetings
          .map(parseMeeting)
          .map(([schedule, location, link], i) => (
            <div key={i}>
              {schedule !== ' -' && (
                <Typography className="text-xs">{schedule}</Typography>
              )}
              {location !== ' ' && (
                <Typography className="text-xs">
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
            </div>
          ))}
      </TableCell>
      {props.hasMultipleDateRanges && (
        <TableCell className={props.lastRow ? 'border-b-0' : ''}>
          {props.data.meetings
            .map(parseDateRange)
            .map(([start_date, end_date], i) => (
              <div key={i}>
                {start_date && end_date && (
                  <Typography className="text-sm">{`${start_date}-${end_date}`}</Typography>
                )}
              </div>
            ))}
        </TableCell>
      )}
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        {props.data.syllabus_uri && (
          <Link
            href={props.data.syllabus_uri}
            target="_blank"
            className="underline text-xs text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            View Syllabus
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}

function MeetingChip(props: {
  color: { fill: string; outline: string; font: string };
  meetings: SectionsData[number]['meetings'] | undefined;
}) {
  if (typeof props.meetings === 'undefined') {
    return null;
  }
  return (
    <div
      className="ml-auto p-1 px-3 rounded-3xl shadow-sm"
      style={{
        backgroundColor: props.color.fill,
        color: props.color.font,
        outline: `2px solid ${props.color.outline}`,
      }}
    >
      <Typography className="text-xs font-semibold text-center">
        {meetingDays(props.meetings[0].meeting_days)}
      </Typography>
      <Typography className="text-xs text-center">
        {props.meetings[0].start_time}
      </Typography>
    </div>
  );
}

type PlannerCardProps = {
  query: SearchQueryMultiSection;
  sections?: SectionsData;
  setPlannerSection: (searchQuery: SearchQuery, section: string) => boolean;
  grades: GenericFetchedData<GradesType>;
  rmp: GenericFetchedData<RMPInterface>;
  removeFromPlanner: () => void;
  selectedSections: SectionsData;
  openConflictMessage: () => void;
  color: { fill: string; outline: string; font: string };
};

const PlannerCard = (props: PlannerCardProps) => {
  const [open, setOpen] = useState(false);

  //appease the typescript gods
  const sections = props.sections;
  const canOpenSections =
    typeof sections !== 'undefined' && sections.length !== 0;
  const canOpenGrades =
    !(typeof props.grades === 'undefined' || props.grades.state === 'error') ||
    !(typeof props.rmp === 'undefined' || props.rmp.state === 'error');
  const [whichOpen, setWhichOpen] = useState<'sections' | 'grades' | null>(
    canOpenSections ? 'sections' : canOpenGrades ? 'grades' : null,
  );
  useEffect(() => {
    if (whichOpen === null) {
      if (canOpenSections) {
        setWhichOpen('sections');
      } else if (canOpenGrades) {
        setWhichOpen('grades');
      }
    }
  }, [canOpenSections, canOpenGrades]);
  function handleOpen() {
    if (
      (whichOpen === 'sections' && canOpenSections) ||
      (whichOpen === 'grades' && canOpenGrades)
    ) {
      setOpen(!open);
    }
  }

  const hasMultipleDateRanges =
    typeof props.sections !== 'undefined' && props.sections.length >= 1
      ? props.sections.some(
          (section) =>
            section.meetings[0].start_date !==
              props.sections![0].meetings[0].start_date ||
            section.meetings[0].end_date !==
              props.sections![0].meetings[0].end_date,
        )
      : false;

  return (
    <Box
      component={Paper}
      className="border border-royal dark:border-cornflower-300 rounded-lg"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleOpen()} // opens/closes the card by clicking anywhere on the row
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleOpen();
          }
        }}
        className={
          'p-4 flex items-center gap-4' +
          (canOpenSections || canOpenGrades ? ' cursor-pointer' : '')
        }
      >
        {/* Left-side Content */}
        <div className="flex items-center">
          <Tooltip
            title={`${open ? 'Minimize' : 'Expand'} ${whichOpen === 'sections' ? 'Sections' : 'Grades and RMP'}`}
            placement="top"
          >
            <IconButton
              aria-label="expand row"
              size="medium"
              onClick={(e) => {
                e.stopPropagation(); // prevents double opening/closing
                handleOpen();
              }}
              disabled={!canOpenSections && !canOpenGrades}
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
              sx={{
                '&.Mui-checked': {
                  color: props.color.fill,
                },
              }}
            />
          </Tooltip>
          <Tooltip title="Switch Opening Sections/Grades" placement="top">
            <ToggleButtonGroup
              value={whichOpen}
              exclusive
              onChange={(_, newValue) => {
                if (newValue === 'sections' && canOpenSections) {
                  setWhichOpen('sections');
                }
                if (newValue === 'grades' && canOpenGrades) {
                  setWhichOpen('grades');
                }
                setOpen(true);
              }}
              size="small"
              aria-label="dropdown switch"
              onClick={(e) => e.stopPropagation()}
              className="ml-2"
            >
              <ToggleButton
                value="sections"
                aria-label="sections"
                disabled={!canOpenSections}
              >
                <EventIcon />
              </ToggleButton>
              <ToggleButton
                value="grades"
                aria-label="grades and rmp"
                disabled={!canOpenGrades}
              >
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
        </div>
        <Typography className="leading-tight text-lg text-gray-500 dark:text-gray-200 w-fit flex-grow">
          {searchQueryLabel(removeSection(props.query))}
        </Typography>
        <MeetingChip
          color={props.color}
          meetings={
            sections?.find(
              (section) =>
                !sectionCanOverlap(section.section_number) &&
                props.query.sectionNumbers?.includes(section.section_number),
            )?.meetings
          }
        />
      </div>

      {canOpenSections && (
        <Collapse
          in={open && whichOpen === 'sections'}
          timeout="auto"
          unmountOnExit
        >
          <TableContainer className="rounded-t-none">
            <Table>
              <TableHead>
                <SectionTableHead
                  hasMultipleDateRanges={hasMultipleDateRanges}
                />
              </TableHead>
              <TableBody>
                {sections.map((section, index) => (
                  <SectionTableRow
                    key={section.section_number}
                    data={section}
                    course={props.query}
                    lastRow={index === sections.length - 1}
                    setPlannerSection={props.setPlannerSection}
                    selectedSections={props.selectedSections}
                    openConflictMessage={props.openConflictMessage}
                    hasMultipleDateRanges={hasMultipleDateRanges}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      )}

      {canOpenGrades && (
        <Collapse
          in={open && whichOpen === 'grades'}
          timeout="auto"
          unmountOnExit
        >
          <div className="p-2 md:p-4 flex flex-col gap-2">
            <SingleGradesInfo
              course={removeSection(props.query)}
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
