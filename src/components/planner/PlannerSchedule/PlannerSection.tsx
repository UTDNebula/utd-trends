import React, { useEffect, useState } from 'react';

import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { SectionsData } from '@/pages/api/sections';

import { DAYS, START_HOUR } from './PlannerSchedule';

type PlannerSectionComponentProps = {
  selectedSection: SectionsData[number];
  course: SearchQuery;
  color: string;
  selected: boolean;
};

const PlannerSection = (props: PlannerSectionComponentProps) => {
  //const SectionComponent = () => {
  console.log(props.selectedSection);
  const [meetings, setMeetings] = useState<string[][]>([]);
  useEffect(() => {
    const tempMeetings = [];
    for (let j = 0; j < props.selectedSection.meetings.length; j++) {
      const meeting = props.selectedSection.meetings[j];
      for (const meeting_day of meeting.meeting_days) {
        const col = DAYS.indexOf(meeting_day) + 1;
        const splitStartTime = meeting.start_time.split(':');
        let startRow = Number(splitStartTime[0]) - START_HOUR + 2;
        // let endTime = Number(meeting.end_time.slice(0, splitStartTime[1].length - 2)) - START_HOUR;
        if (meeting.start_time.includes('pm')) {
          startRow += 12;
        }

        /**  TODO: what if no start/endtime **/
        const s_h =
          Number(meeting.start_time.split(':')[0]) +
          (meeting.start_time.includes('pm') ? 12 : 0);
        const s_m = Number(meeting.start_time.split(':')[1].slice(0, 2));
        let e_h =
          Number(meeting.end_time.split(':')[0]) +
          (meeting.end_time.includes('pm') ? 12 : 0);
        const e_m = Number(meeting.end_time.split(':')[1].slice(0, 2));

        let d_h = 0;
        let d_m = 0;
        if (e_m < s_m) {
          // lmao i'm doing elementary carry subtraction
          e_h--;
          d_m = e_m + 60 - s_m;
        } else d_m = e_m - s_m;
        d_h = e_h - s_h;

        const lengthPercentHour = ((d_h * 60 + d_m) * 125) / 90;

        const offset =
          Number(splitStartTime[1].slice(0, splitStartTime[1].length - 2)) / 60;
        const offsetTotalPercent = offset * 100;
        tempMeetings.push([
          col.toString(),
          startRow.toString(),
          lengthPercentHour.toString(),
          offsetTotalPercent.toString(),
        ]);
      }
    }
    setMeetings(tempMeetings);
  }, [props.selectedSection]);

  return meetings.map((x: string[], i: number) => (
    <div
      key={props.selectedSection._id + i}
      style={
        {
          '--start-col': x[0],
          '--start-row': x[1],
          '--height': x[2] + '%',
          '--offset': x[3] + '%',
          '--color': props.color,
          '--opacity':  props.selected ? "1" : "0.5",
        } as React.CSSProperties
      }
      className={`col-start-[var(--start-col)] col-span-1 row-start-[var(--start-row)] row-span-1 relative top-[var(--offset)] h-[var(--height)] overflow-visible rounded-lg bg-[var(--color)] opacity-[var(--opacity)]`}
    >
      <div>{searchQueryLabel(props.course)}</div>
      <div>{props.selectedSection.section_number}</div>
    </div>
  ));
};

export default PlannerSection;
