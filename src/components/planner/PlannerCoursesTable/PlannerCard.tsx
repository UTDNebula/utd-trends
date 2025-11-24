'use client';

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
import React, { useState } from 'react';

import SingleGradesInfo from '@/components/common/SingleGradesInfo/SingleGradesInfo';
import SingleProfInfo from '@/components/common/SingleProfInfo/SingleProfInfo';
import type { Sections, SectionsData } from '@/modules/fetchSections';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQueryMultiSection,
  type SearchResult,
  sectionCanOverlap,
} from '@/types/SearchQuery';
import { useSearchResult } from '@/modules/plannerFetch';
import { calculateGrades } from '@/modules/fetchGrades';
import { useSharedState } from '@/app/SharedStateProvider';

export function LoadingPlannerCard() {
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

function parseDateRange(meeting: Sections['all'][number]['meetings'][number]) {
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

function parseMeeting(meeting: Sections['all'][number]['meetings'][number]) {
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
  data: Sections['all'][number];
  syllabusSections: SectionsData;
  course: SearchQueryMultiSection;
  lastRow: boolean;
  hasMultipleDateRanges: boolean;
  selectedSections: Sections['all'];
  openConflictMessage: () => void;
};

function SectionTableRow(props: SectionTableRowProps) {
  const { setPlannerSection} = useSharedState();
  const isSelected = props.selectedSections.some(
    (el) =>
      el.section_number == props.data.section_number && // check the section number
      el.course_details?.some(
        // and also if the course is the same
        (c) =>
          c.subject_prefix == props.course.prefix &&
          c.course_number == props.course.number,
      ),
  );
  const allSectionsOfProfWithSyllabus = props.syllabusSections.filter((s) =>
    s.professor_details?.find(
      (p) =>
        props.data.professor_details &&
        props.data.professor_details.find(
          (prof) =>
            prof.first_name == p.first_name && prof.last_name == p.last_name,
        ),
    ),
  );
  const bestSyllabus =
    allSectionsOfProfWithSyllabus && allSectionsOfProfWithSyllabus[0]
      ? allSectionsOfProfWithSyllabus[0].syllabus_uri
      : props.syllabusSections && props.syllabusSections[0]
        ? props.syllabusSections[0].syllabus_uri
        : ''; // try to get latest syllabus of professor, else the latest syllabus
  let syllabusToShow = props.data.syllabus_uri ?? bestSyllabus; // either selected section's (for next sem) or the best one overall
  if (syllabusToShow == '') {
    syllabusToShow = bestSyllabus;
  }
  return (
    <TableRow>
      <TableCell className={props.lastRow ? 'border-b-0' : ''}>
        {
          <Radio
            checked={isSelected}
            onClick={() => {
              setPlannerSection(
                props.data, props.selectedSections, isSelected, props.openConflictMessage
              ); // using the section's course and prof details every time ensures overall matches de/selection behavior
            }}
          />
        }
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
              {schedule !== ' -' ? (
                <Typography className="text-xs">{schedule}</Typography>
              ) : (
                <Typography className="text-xs italic">
                  No Meeting Time
                </Typography>
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
        <div style={{ fontSize: '10px', color: 'gray' }}>
          {syllabusToShow != '' ? (
            <Link
              href={syllabusToShow}
              target="_blank"
              className="underline text-xs text-blue-600 hover:text-blue-800 visited:text-purple-600"
            >
              {syllabusToShow === props.data.syllabus_uri
                ? 'View Syllabus'
                : 'View Previous Syllabus'}
            </Link>
          ) : (
            ''
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function MeetingChip(props: {
  color: { fill: string; outline: string; font: string };
  meetings: Sections['all'][number]['meetings'] | undefined;
  extraSelected: SectionsData;
}) {
  if (typeof props.meetings === 'undefined') {
    return null;
  }
  const extraIndicator = props.extraSelected.find((x) =>
    sectionCanOverlap(x.section_number, 'extra'),
  )
    ? '+lab'
    : props.extraSelected.find((x) =>
          sectionCanOverlap(x.section_number, 'exam'),
        )
      ? '+ex'
      : '';
  return (
    <div
      className="ml-auto p-1 px-3 rounded-3xl shadow-xs relative"
      style={{
        backgroundColor: props.color.fill,
        color: props.color.font,
        outline: `2px solid ${props.color.outline}`,
      }}
    >
      {extraIndicator.length > 0 && (
        <div
          className="absolute -top-2 -right-3 w-fit h-5 px-2 rounded-full flex items-center justify-center text-[0.625rem] font-bold"
          style={{
            backgroundColor: props.color.font,
            color: props.color.outline,
          }}
        >
          {extraIndicator}
        </div>
      )}
      <Typography className="text-xs font-semibold text-center min-w-13">
        {meetingDays(props.meetings[0].meeting_days) || 'Time'}
      </Typography>
      <Typography className="text-xs text-center">
        {props.meetings[0].start_time || 'TBD'}
      </Typography>
    </div>
  );
}

type PlannerCardProps = {
  query: SearchQueryMultiSection;
  removeFromPlanner: () => void;
  selectedSections: Sections['all'];
  openConflictMessage: () => void;
  color: { fill: string; outline: string; font: string };
  latestSemester: string;
  extraSections?: SearchResult;
  extraLabel?: string;
};

export default function PlannerCard(props: PlannerCardProps) {
  const [open, setOpen] = useState(false);
  const { isSuccess, data: result } = useSearchResult(props.query);
  const [whichOpen, setWhichOpen] = useState<'sections' | 'grades'>('sections');
  const { setPreviewCourses } = useSharedState();
  if (!isSuccess) {
    return <LoadingPlannerCard />;
  }
  function handleOpen() {
    if (whichOpen === 'sections' || whichOpen === 'grades') {
      const newOpen = !open;
      setOpen(newOpen);

      // Update previewCourses
      if (newOpen) {
        setPreviewCourses((prev) => {
          if (
            prev.some((course) =>
              searchQueryEqual(
                removeSection(course),
                removeSection(props.query),
              ),
            )
          ) {
            return prev;
          }
          return [...prev, props.query];
        });
      } else {
        setPreviewCourses((prev) =>
          prev.filter(
            (course) =>
              !searchQueryEqual(
                removeSection(course),
                removeSection(props.query),
              ),
          ),
        );
      }
    }
  }

  let allSectionsWithSyllabus = result.sections
    .filter((s) => !!s.syllabus_uri && !!s.academic_session?.start_date)
    .sort(
      (a, b) =>
        new Date(b.academic_session.start_date).getTime() -
        new Date(a.academic_session.start_date).getTime(),
    ); // all sections of the course, sorted by most recent syllabus
  if (props.extraSections && props.extraLabel == 'lab')
    allSectionsWithSyllabus = allSectionsWithSyllabus.filter((s) =>
      sectionCanOverlap(s.section_number, 'extra'),
    );
  // only keep extra sections for syllabus lookup
  else if (props.extraSections && props.extraLabel == 'exam')
    allSectionsWithSyllabus = allSectionsWithSyllabus.filter((s) =>
      sectionCanOverlap(s.section_number, 'exam'),
    );
  // only keep exam sections for syllabus lookup
  else if (props.extraSections && props.extraLabel == 'unassigned')
    allSectionsWithSyllabus = allSectionsWithSyllabus.filter(() => false); // No syllabi should be shown

  let latestMatchedSections: SearchResult = result; // fallback if filtering is null, at least it will have correct grade/rmp data
  let latestExtraSections: SearchResult | null = null;
  if (!props.extraSections) {
    latestMatchedSections = {
      ...result,
      sections: result.sections.filter(
        (section) =>
          section.academic_session.name == props.latestSemester && // latest sem's sections only
          ((!props.query.profFirst && !props.query.profLast) || // if overall, should show every prof's section
            (section.professor_details &&
              section.professor_details.find(
                (prof) => prof.first_name == props.query.profFirst,
              ) &&
              section.professor_details.find(
                (prof) => prof.last_name == props.query.profLast,
              ))) && // else, show only this professor's sections (a section *can* have multiple profs)
          !sectionCanOverlap(section.section_number), // that are not "Extra"
      ),
    };
    latestExtraSections = {
      ...result,
      sections: result.sections.filter(
        (section) =>
          section.academic_session.name == props.latestSemester && // latest sem's sections only
          (!(section.professor_details && section.professor_details[0]) || // either have no professor assigned, or
            sectionCanOverlap(section.section_number)), // be an "Extra" section (labs, exams, etc)
      ),
    };
  } else {
    latestMatchedSections = props.extraSections;
  }

  const hasMultipleDateRanges =
    typeof latestMatchedSections.sections !== 'undefined' &&
    latestMatchedSections.sections.length >= 1
      ? latestMatchedSections.sections.some(
          (section) =>
            section.meetings[0].start_date !==
              latestMatchedSections.sections![0].meetings[0].start_date ||
            section.meetings[0].end_date !==
              latestMatchedSections.sections![0].meetings[0].end_date,
        )
      : false;
  return (
    <Box
      component={Paper}
      className={
        'border border-royal dark:border-cornflower-300 rounded-lg' +
        (props.extraSections
          ? ' my-4 mx-5 bg-[rgb(250,250,250)] dark:bg-[rgb(10,10,10)]'
          : '')
      }
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
        className={'p-4 flex items-center gap-4 cursor-pointer'}
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
              className={'transition-transform' + (open ? ' rotate-90' : '')}
            >
              <KeyboardArrowIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          {!props.extraSections && (
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
          )}
          {!props.extraSections && (
            <Tooltip title="Switch Opening Sections/Grades" placement="top">
              <ToggleButtonGroup
                value={whichOpen}
                exclusive
                onChange={(_, newValue) => {
                  if (newValue === 'sections') {
                    setWhichOpen('sections');
                  }
                  if (newValue === 'grades') {
                    setWhichOpen('grades');
                  }
                  setOpen(true);
                }}
                size="small"
                aria-label="dropdown switch"
                onClick={(e) => e.stopPropagation()}
                className="ml-2"
              >
                <ToggleButton value="sections" aria-label="sections">
                  <EventIcon />
                </ToggleButton>
                <ToggleButton value="grades" aria-label="grades and rmp">
                  <BarChartIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>
          )}
        </div>
        {!props.extraSections ? (
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 w-fit grow">
            <Tooltip
              title={
                typeof props.query.prefix !== 'undefined' &&
                typeof props.query.number !== 'undefined'
              }
              placement="top"
            >
              <span>{searchQueryLabel(convertToCourseOnly(props.query))}</span>
            </Tooltip>
            {typeof props.query.profFirst !== 'undefined' &&
              typeof props.query.profLast !== 'undefined' &&
              typeof props.query.prefix !== 'undefined' &&
              typeof props.query.number !== 'undefined' && <span> </span>}
            <Tooltip
              title={
                typeof props.query.profFirst !== 'undefined' &&
                typeof props.query.profLast !== 'undefined' &&
                ((latestMatchedSections.type === 'professor' ||
                  latestMatchedSections.type === 'combo') &&
                latestMatchedSections.RMP &&
                latestMatchedSections.RMP.teacherRatingTags.length > 0
                  ? 'Tags: ' +
                    latestMatchedSections.RMP.teacherRatingTags
                      .sort((a, b) => b.tagCount - a.tagCount)
                      .slice(0, 3)
                      .map((tag) => tag.tagName)
                      .join(', ')
                  : 'No Tags Available')
              }
              placement="top"
            >
              <span>{searchQueryLabel(convertToProfOnly(props.query))}</span>
            </Tooltip>
            {((typeof props.query.profFirst === 'undefined' &&
              typeof props.query.profLast === 'undefined') ||
              (typeof props.query.prefix === 'undefined' &&
                typeof props.query.number === 'undefined')) && (
              <span> (Overall)</span>
            )}
          </Typography>
        ) : (
          <Typography className="leading-tight text-lg text-gray-600 dark:text-gray-200 w-fit grow">
            <Tooltip
              title={
                props.extraLabel == 'lab'
                  ? 'Lab/Discussion/Practice Sections for ' +
                    searchQueryLabel(convertToCourseOnly(props.query))
                  : props.extraLabel == 'exam'
                    ? 'Exam Sections for ' +
                      searchQueryLabel(convertToCourseOnly(props.query))
                    : 'Sections of ' +
                      searchQueryLabel(convertToCourseOnly(props.query)) +
                      ' without a Professor assigned yet'
              }
              placement="top"
            >
              <span>
                {props.extraLabel == 'lab'
                  ? 'Lab Sections'
                  : props.extraLabel == 'exam'
                    ? 'Exam Sections'
                    : 'Sections without Professors'}
              </span>
            </Tooltip>
          </Typography>
        )}
        <MeetingChip
          color={props.color}
          meetings={
            latestMatchedSections.sections.find((section) =>
              props.selectedSections.find(
                (s) =>
                  s.section_number === section.section_number &&
                  s.course_details &&
                  s.course_details[0] &&
                  section.course_details &&
                  section.course_details[0] &&
                  s.course_details[0].subject_prefix ===
                    section.course_details[0].subject_prefix &&
                  s.course_details[0].course_number ===
                    section.course_details[0].course_number,
              ),
            )?.meetings
          }
          extraSelected={
            latestExtraSections != null
              ? [
                  latestExtraSections.sections.find((section) =>
                    props.selectedSections.find(
                      (s) =>
                        s.section_number === section.section_number &&
                        s.course_details &&
                        s.course_details[0] &&
                        section.course_details &&
                        section.course_details[0] &&
                        s.course_details[0].subject_prefix ===
                          section.course_details[0].subject_prefix &&
                        s.course_details[0].course_number ===
                          section.course_details[0].course_number,
                    ),
                  ),
                ].filter((s) => s != undefined)
              : []
          }
        />
      </div>

      {
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
                {latestMatchedSections.sections.map((section, index) => (
                  <SectionTableRow
                    key={section._id}
                    data={section}
                    syllabusSections={allSectionsWithSyllabus}
                    course={props.query}
                    lastRow={
                      index === latestMatchedSections.sections.length - 1
                    }
                    selectedSections={props.selectedSections}
                    openConflictMessage={props.openConflictMessage}
                    hasMultipleDateRanges={hasMultipleDateRanges}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Unassigned Professor Sections -- only show for a non-overall card */}
          {props.query.profFirst != null &&
            props.query.profLast !== null &&
            latestExtraSections &&
            latestExtraSections.sections.filter(
              (section) =>
                section.professor_details?.length == 0 &&
                !sectionCanOverlap(section.section_number),
            ).length > 0 && (
              <PlannerCard
                key={searchQueryLabel(props.query) + ' extra sections'}
                query={props.query}
                removeFromPlanner={props.removeFromPlanner}
                selectedSections={props.selectedSections}
                openConflictMessage={props.openConflictMessage}
                color={props.color}
                latestSemester={props.latestSemester}
                extraSections={{
                  ...latestExtraSections,
                  sections: latestExtraSections.sections.filter(
                    (section) =>
                      section.professor_details?.length == 0 &&
                      !sectionCanOverlap(section.section_number),
                  ),
                }}
                extraLabel="unassigned"
              />
            )}
          {/* Extra Sections (Lab, Discussion, Etc) -- with prof assigned or without too */}
          {latestExtraSections &&
            latestExtraSections.sections.filter((section) =>
              sectionCanOverlap(section.section_number, 'extra'),
            ).length > 0 && (
              <PlannerCard
                key={searchQueryLabel(props.query) + ' lab sections'}
                query={props.query}
                removeFromPlanner={props.removeFromPlanner}
                selectedSections={props.selectedSections}
                openConflictMessage={props.openConflictMessage}
                color={props.color}
                latestSemester={props.latestSemester}
                extraSections={{
                  ...latestExtraSections,
                  sections: latestExtraSections.sections.filter((section) =>
                    sectionCanOverlap(section.section_number, 'extra'),
                  ),
                }}
                extraLabel="lab"
              />
            )}
          {/* Extra Sections (Exam) -- with prof assigned or without too */}
          {latestExtraSections &&
            latestExtraSections.sections.filter((section) =>
              sectionCanOverlap(section.section_number, 'exam'),
            ).length > 0 && (
              <PlannerCard
                key={searchQueryLabel(props.query) + ' exam sections'}
                query={props.query}
                removeFromPlanner={props.removeFromPlanner}
                selectedSections={props.selectedSections}
                openConflictMessage={props.openConflictMessage}
                color={props.color}
                latestSemester={props.latestSemester}
                extraSections={{
                  ...latestExtraSections,
                  sections: latestExtraSections.sections.filter((section) =>
                    sectionCanOverlap(section.section_number, 'exam'),
                  ),
                }}
                extraLabel="exam"
              />
            )}
        </Collapse>
      }

      {
        <Collapse
          in={open && whichOpen === 'grades'}
          timeout="auto"
          unmountOnExit
        >
          <div className="p-2 md:p-4 flex flex-col gap-2">
            <SingleGradesInfo
              course={removeSection(props.query)}
              grades={latestMatchedSections.grades}
              filteredGrades={calculateGrades(latestMatchedSections.grades)}
            />
            {(latestMatchedSections.type === 'professor' ||
              latestMatchedSections.type === 'combo') &&
              latestMatchedSections.RMP && (
                <SingleProfInfo rmp={latestMatchedSections.RMP} />
              )}
          </div>
        </Collapse>
      }
    </Box>
  );
}
