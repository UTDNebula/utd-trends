import React, { useEffect, useState } from 'react';

import { type SearchQuery } from '@/modules/SearchQuery/SearchQuery';
import type { SectionsData } from '@/pages/api/sections';

import { DAYS, numDays, START_HOUR } from './PlannerSchedule';

type PlannerSectionComponentProps = {
  selectedSection: SectionsData[number];
  course: SearchQuery;
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

        let dayKey = meeting.meeting_days
          .map((day) => (day === 'Thursday' ? 'Z' : day.charAt(0)))
          .join('');

        tempMeetings.push([
          col.toString(),
          startRow.toString(),
          lengthPercentHour.toString(),
          offsetTotalPercent.toString(),
          dayKey,
          (d_h * 60 + d_m).toString(),
        ]);
      }
    }
    setMeetings(tempMeetings);
    console.log(numDays + 2);
  }, [props.selectedSection]);

  const colorMap: { [key: string]: string } = {
    MW: 'bg-[#2D9DDD]',
    TZ: 'bg-[#EB9B5A]',
    ZF: 'bg-[#F0E549]',
    WF: 'bg-[#563CFB]',
    MWF: 'bg-[#F7ADCD]',
    ZFS: 'bg-[#DD4E4E]',
    MTWZ: 'bg-purple-800',
    M: 'bg-[#62D425]',
    W: 'bg-[#62D425]',
    T: 'bg-[#62D425]',
    Z: 'bg-[#62D425]',
    F: 'bg-[#62D425]',
    S: 'bg-[#62D425]',
  };

  return meetings.map((x: string[], i: number) => {
    return (
      <div
        key={props.selectedSection._id + i}
        style={
          {
            '--start-col': x[0],
            '--start-row': x[1],
            '--offset': x[3] + '%',
            '--height': x[2] + '%',
          } as React.CSSProperties
        }
        className={`col-start-[var(--start-col)] col-span-1 
          row-start-[var(--start-row)] row-span-1 relative 
          top-[var(--offset)] h-[var(--height)] overflow-hidden 
          rounded-lg ${colorMap[x[4]] || 'bg-purple-100'} 
          m-1 leading-relaxed shadow-md text-white`}
      >
        <div className={`text-lg font-lato text-center`}>
          {props.course.prefix} {props.course.number}.
          {props.selectedSection.section_number}
        </div>
        <div className="text-xs text-center">
          {props.course.profFirst} {props.course.profLast}
        </div>
        <div className="text-xs text-center">
          {props.selectedSection.meetings[0]?.location?.building}{' '}
          {props.selectedSection.meetings[0]?.location?.room}
        </div>
      </div>
    );
  });
};
export default PlannerSection;
