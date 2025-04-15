import React from 'react';

import {
  DAYS,
  START_HOUR,
} from '@/components/planner/PlannerSchedule/PlannerSchedule';
import type { Sections } from '@/modules/fetchSections';
import { type SearchQuery } from '@/types/SearchQuery';

interface PlannerSectionComponentProps {
  selectedSection: Sections['all'][number] | undefined;
  course: SearchQuery;
  color: { fill: string; outline: string; font: string };
}

export default function PlannerSection(props: PlannerSectionComponentProps) {
  const selectedSection = props.selectedSection;
  if (typeof selectedSection === 'undefined') {
    return null;
  }

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
      <div
        key={selectedSection._id + i}
        style={
          {
            '--start-col': x[0],
            '--start-row': x[1],
            '--offset': x[3] + '%',
            '--height': x[2] + '%',
            backgroundColor: props.color.fill,
            borderColor: props.color.outline,
            color: props.color.font,
          } as React.CSSProperties
        }
        className={`col-start-[var(--start-col)] col-span-1 
          row-start-[var(--start-row)] row-span-1 relative 
          top-[var(--offset)] h-[var(--height)] overflow-hidden 
          rounded-xl border-2
          ml-1 leading-relaxed`}
      >
        <div
          className={
            'font-semibold text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
            (makeBigger ? 'text-sm' : 'text-xs leading-none')
          }
        >
          {props.course.prefix} {props.course.number}.
          {selectedSection.section_number}
        </div>
        <div
          className={
            'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
            (makeBigger ? '' : 'leading-none')
          }
        >
          {props.course.profFirst} {props.course.profLast}
        </div>
        <div
          className={
            'text-xs text-center whitespace-nowrap text-ellipsis overflow-hidden ' +
            (makeBigger ? '' : 'leading-none')
          }
        >
          {selectedSection.meetings[0]?.location?.building}{' '}
          {selectedSection.meetings[0]?.location?.room}
        </div>
      </div>
    );
  });
}
