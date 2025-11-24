import { Tooltip } from '@mui/material';
import React, { useState } from 'react';

import {
  DAYS,
  START_HOUR,
} from '@/components/planner/PlannerSchedule/PlannerSchedule';
import { type SearchQuery } from '@/types/SearchQuery';
import { useSearchResult } from '@/modules/plannerFetch';
import { useSharedState } from '@/app/SharedStateProvider';
import { KeyboardArrowDown } from '@mui/icons-material';

interface PlannerSectionComponentProps {
  scoot?: number;
  sectionNumber: string;
  course: SearchQuery;
  color: { fill: string; outline: string; font: string; filter?: string };
  isPreview?: boolean;
  nooffset?: boolean;
  placeholder?: boolean;
  coursesInGroup?: string[];
  onSectionClick?: (
    course: SearchQuery,
    sectionNumber: string,
    event?: React.MouseEvent,
  ) => void;
  onSectionHover?: (
    course: SearchQuery,
    sectionNumber: string,
    isHovered: boolean,
  ) => void;
}

const previewColor = (color: {
  fill: string;
  outline: string;
  font: string;
}) => {
  return {
    fill: color.fill,
    outline: color.outline,
    font: color.font,
    filter: 'saturate(0.2) opacity(0.7)',
  };
};

export default function PlannerSection(props: PlannerSectionComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { latestSemester } = useSharedState();
  const result = useSearchResult(props.course);
  if (!result.isSuccess || result.data.type === 'professor') {
    return null;
  }
  const selectedSection = result.data.sections.find(
    (s) =>
      s.section_number === props.sectionNumber &&
      s.academic_session.name === latestSemester,
  );
  if (selectedSection === undefined) return null;
  const courseName = result.data.courseName;

  // If nooffset is true, return a simple non-positioned element
  if (props.nooffset) {
    const currentColor = props.isPreview
      ? isHovered
        ? props.color
        : previewColor(props.color)
      : props.color;

    return (
      <div
        className="p-2 rounded-xl border-2 m-1 cursor-pointer"
        style={{
          backgroundColor: currentColor.fill,
          borderColor: isHovered ? 'red' : currentColor.outline,
          color: currentColor.font,
          filter: currentColor.filter,
        }}
        role="button"
        tabIndex={0}
        onMouseEnter={() => {
          if (props.isPreview) {
            setIsHovered(true);
            props.onSectionHover?.(
              props.course,
              selectedSection.section_number,
              true,
            );
          }
        }}
        onMouseLeave={() => {
          if (props.isPreview) {
            setIsHovered(false);
            props.onSectionHover?.(
              props.course,
              selectedSection.section_number,
              false,
            );
          }
        }}
        onClick={(event) => {
          if (props.isPreview && props.onSectionClick && selectedSection) {
            props.onSectionClick(
              props.course,
              selectedSection.section_number,
              event,
            );
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (props.isPreview && props.onSectionClick && selectedSection) {
              props.onSectionClick(
                props.course,
                selectedSection.section_number,
              );
            }
          }
        }}
      >
        <div className="font-semibold text-center text-sm">
          {props.course.prefix} {props.course.number}.
          {selectedSection.section_number}
        </div>
        <div className="text-xs text-center">
          {props.course.profFirst} {props.course.profLast}
        </div>
        <div className="text-xs text-center">
          {selectedSection.meetings[0]?.location?.building}{' '}
          {selectedSection.meetings[0]?.location?.room}
        </div>
      </div>
    );
  }

  const currentColor = props.isPreview
    ? isHovered
      ? props.color
      : previewColor(props.color)
    : props.color;

  const meetings: string[][] = [];
  for (let j = 0; j < selectedSection.meetings.length; j++) {
    const meeting = selectedSection.meetings[j];
    for (const meeting_day of meeting.meeting_days) {
      const col = DAYS.indexOf(meeting_day) + 1;
      const splitStartTime = meeting.start_time.split(':');
      let startRow = Number(splitStartTime[0]) - START_HOUR + 2;
      // let endTime = Number(meeting.end_time.slice(0, splitStartTime[1].length - 2)) - START_HOUR;
      const startHour = Number(meeting.start_time.split(':')[0]);
      const endHour = Number(meeting.end_time.split(':')[0]);

      const isPM = (time: string) => time.includes('pm');

      if (isPM(meeting.start_time) && startHour !== 12) {
        startRow += 12;
      }

      /**  TODO: what if no start/endtime **/
      const s_h =
        Number(meeting.start_time.split(':')[0]) +
        (isPM(meeting.start_time) && startHour !== 12 ? 12 : 0);
      const s_m = Number(meeting.start_time.split(':')[1].slice(0, 2));
      let e_h =
        Number(meeting.end_time.split(':')[0]) +
        (isPM(meeting.end_time) && endHour !== 12 ? 12 : 0);
      const e_m = Number(meeting.end_time.split(':')[1].slice(0, 2));

      let d_h = 0;
      let d_m = 0;
      if (e_m < s_m) {
        // lmao i'm doing elementary carry subtraction
        e_h--;
        d_m = e_m + 60 - s_m;
      } else d_m = e_m - s_m;
      d_h = e_h - s_h;

      const lengthPercentHour = ((d_h * 60 + d_m) * 100) / 60;

      const offset =
        Number(splitStartTime[1].slice(0, splitStartTime[1].length - 2)) / 60;
      const offsetTotalPercent = offset * 100;

      const dayKey = meeting.meeting_days
        .map((day) => (day === 'Thursday' ? 'Z' : day.charAt(0)))
        .join('');

      meetings.push([
        col.toString(),
        startRow.toString(),
        lengthPercentHour.toString(),
        offsetTotalPercent.toString(),
        dayKey,
        (d_h * 60 + d_m).toString(),
      ]);
    }
  }

  return meetings.map((x: string[], i: number) => {
    const makeBigger = parseInt(x[2]) > 100;
    return (
      <Tooltip
        key={selectedSection._id + i}
        title={courseName}
        placement="top"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10],
                },
              },
            ],
          },
        }}
      >
        <button
          type="button"
          style={
            {
              '--start-col': x[0],
              '--start-row': x[1],
              '--offset': x[3] + '%',
              '--height': x[2] + '%',
              '--left-offset': props.scoot ? `${props.scoot * 15}%` : '0%',
              backgroundColor: currentColor.fill,
              borderColor: isHovered ? 'red' : currentColor.outline,
              color: currentColor.font,
              filter: currentColor.filter,
              zIndex: props.scoot || 0,
            } as React.CSSProperties
          }
          className={`col-start-[var(--start-col)] col-span-1 
            row-start-[var(--start-row)] row-span-1 relative 
            top-[var(--offset)] h-[var(--height)] overflow-hidden 
            rounded-xl border-2
            ml-[var(--left-offset)] leading-relaxed ${props.isPreview ? 'cursor-pointer' : ''}`}
          onMouseEnter={() => {
            if (props.isPreview) {
              setIsHovered(true);
              props.onSectionHover?.(
                props.course,
                selectedSection.section_number,
                true,
              );
            }
          }}
          onMouseLeave={() => {
            if (props.isPreview) {
              setIsHovered(false);
              props.onSectionHover?.(
                props.course,
                selectedSection.section_number,
                false,
              );
            }
          }}
          onClick={(event) => {
            if (props.isPreview && props.onSectionClick && selectedSection) {
              props.onSectionClick(
                props.course,
                selectedSection.section_number,
                event,
              );
            }
          }}
        >
          {!props.placeholder ? (
            <>
              <div
                className={
                  'font-semibold text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                  (makeBigger ? 'text-sm' : 'text-xs leading-none')
                }
              >
                {selectedSection.course_details &&
                selectedSection.course_details[0]
                  ? selectedSection.course_details[0].subject_prefix +
                    ' ' +
                    selectedSection.course_details[0].course_number
                  : ''}
                .{selectedSection.section_number}
              </div>
              {selectedSection.professor_details &&
                selectedSection.professor_details[0] &&
                selectedSection.professor_details.map((prof) => (
                  <div
                    key={prof._id}
                    className={
                      'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                      (makeBigger ? '' : 'leading-none')
                    }
                  >
                    {prof.first_name + ' ' + prof.last_name}
                  </div>
                ))}
              <div
                className={
                  'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                  (makeBigger ? '' : 'leading-none')
                }
              >
                {props.placeholder ? (
                  <KeyboardArrowDown className="mx-auto -my-1" />
                ) : (
                  selectedSection.meetings[0]?.location?.building +
                  ' ' +
                  selectedSection.meetings[0]?.location?.room
                )}
              </div>
            </>
          ) : (
            <>
              <div
                className={
                  'font-semibold text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                  (makeBigger ? 'text-sm' : 'text-xs leading-none')
                }
              >
                Multiple Sections
              </div>
              <div
                className={
                  'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                  (makeBigger ? '' : 'leading-none')
                }
              >
                {props.coursesInGroup?.join(', ')}
              </div>
              <div
                className={
                  'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
                  (makeBigger ? '' : 'leading-none')
                }
              >
                {props.placeholder ? (
                  <KeyboardArrowDown className="mx-auto -my-1" />
                ) : (
                  selectedSection.meetings[0]?.location?.building +
                  ' ' +
                  selectedSection.meetings[0]?.location?.room
                )}
              </div>
            </>
          )}
        </button>
      </Tooltip>
    );
  });
}
