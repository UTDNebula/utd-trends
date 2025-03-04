import React, { useEffect, useState } from 'react';

const sampleSectionData = [
  {
    _id: '672f168a3e61da2b1e596bf2',
    section_number: '0U1',
    course_reference: '672f16483e61da2b1e59243c',
    section_corequisites: null,
    academic_session: {
      name: '19U',
      start_date: '2019-05-23T05:00:00Z',
      end_date: '2019-08-07T05:00:00Z',
    },
    professors: ['672f167f3e61da2b1e5960c0'],
    teaching_assistants: [],
    internal_class_number: '52738',
    instruction_mode: 'Face-to-Face',
    meetings: [
      {
        start_date: '2019-05-23T05:00:00Z',
        end_date: '2019-08-05T05:00:00Z',
        meeting_days: ['Tuesday', 'Thursday'],
        start_time: '3:15pm',
        end_time: '5:15pm',
        modality: '',
        location: {
          building: 'JSOM',
          room: '12.202',
          map_uri: 'https://locator.utdallas.edu/JSOM_12.202',
        },
      },
    ],
    core_flags: ['070'],
    syllabus_uri: 'https://dox.utdallas.edu/syl82961',
    grade_distribution: [2, 7, 7, 5, 3, 9, 2, 4, 1, 1, 0, 0, 2, 0],
    attributes: null,
  },
];

export type SectionData = {
  _id: string;
  section_number: string;
  course_reference: string;
  section_corequisites: null;
  academic_session: {
    name: string;
    start_date: string;
    end_date: string;
  };
  professors: string[];
  teaching_assistants: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  };
  internal_class_number: string;
  instruction_mode: string;
  meetings: {
    start_date: string;
    end_date: string;
    meeting_days: string[];
    start_time: string;
    end_time: string;
    modality: string;
    location: {
      building: string;
      room: string;
      map_uri: string;
    };
  }[];
  core_flags: string[];
  syllabus_uri: string;
  grade_distribution: number[];
  attributes: unknown;
}[];

// hours shown (24-hour time)
const START_HOUR = 8;
const END_HOUR = 21;
// days shown (0 = sunday -> 6 = Saturday)
// don't change this rn (grid has 5 columns)
const START_DAY = 1;
const END_DAY = 5;
const numHours = END_HOUR - START_HOUR;
const numDays = END_DAY - START_DAY;
const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type PlannerScheduleProps = {
  selectedSections: SectionData[];
};

const PlannerSchedule = (props: PlannerScheduleProps) => {
  //const PlannerCoursesTable = () => {
  const [meetings, setMeetings] = useState<string[][]>([]);
  useEffect(() => {
    const tempMeetings = [];
    for (let i = 0; i < sampleSectionData.length; i++) {
      for (let j = 0; j < sampleSectionData[i].meetings.length; j++) {
        const meeting = sampleSectionData[i].meetings[j];
        for (const meeting_day of meeting.meeting_days) {
          const col = DAYS.indexOf(meeting_day) + 1;
          const splitStartTime = meeting.start_time.split(':');
          let startRow = Number(splitStartTime[0]) - START_HOUR + 2;
          // let endTime = Number(meeting.end_time.slice(0, splitStartTime[1].length - 2)) - START_HOUR;
          if (meeting.start_time.includes('pm')) {
            startRow += 12;
          }
          const lengthPercentHour = '125'; // TODO: FIX THIS OBVIOUSLY
          const offset =
            Number(splitStartTime[1].slice(0, splitStartTime[1].length - 2)) /
            60;
          const offsetTotalPercent = offset * 100;
          tempMeetings.push([
            col.toString(),
            startRow.toString(),
            lengthPercentHour,
            offsetTotalPercent.toString(),
          ]);
        }
      }
    }
    setMeetings(tempMeetings);
    console.log(numDays + 2);
  }, [props.selectedSections]);

  return (
    <div
      style={{ '--num-rows': numDays + 1 } as React.CSSProperties}
      className={`w-full h-[calc(100vh-2rem)] grid grid-cols-[max-content_repeat(5,minmax(0,1fr))] overflow-scroll rounded-2xl grid-rows-[min-content] auto-rows-fr`}
    >
      {/*Weekday Headers*/}
      <div className="grid col-span-full grid-flow-row bg-cornflower-500 grid-cols-subgrid">
        <div className="col-span-1 h-min"></div>
        {DAYS.slice(START_DAY, END_DAY + 1).map((x, i) => (
          <p key={i} className="text-sm col-span-1 border-l text-center h-min">
            {x}
          </p>
        ))}
      </div>
      {/*Times on the side*/}
      {[...Array(numHours)].map((x, i) => (
        <HourRow key={i} hour={i + START_HOUR} />
      ))}
      {meetings.map((x, i) => (
        <div
          key={i}
          style={
            {
              '--start-col': x[0],
              '--start-row': x[1],
              '--offset': x[3] + '%',
              '--height': x[2] + '%',
            } as React.CSSProperties
          }
          className={`col-start-[var(--start-col)] col-span-1 row-start-[var(--start-row)] row-span-1 relative top-[var(--offset)] h-[var(--height)] overflow-visible rounded-lg bg-cornflower-500`}
        >
          Section
        </div>
      ))}
    </div>
  );
};

type HourRowProps = {
  key: number;
  hour: number;
};

const HourRow = (props: HourRowProps) => {
  return (
    <div
      style={
        {
          '--row-start-row': props.hour + 2 - START_HOUR,
        } as React.CSSProperties
      }
      className={`grid row-span-1 row-start-[(var(--row-start-row))] col-span-full grid-rows-subgrid grid-cols-subgrid`}
    >
      <p
        className={`text-sm col-span-1 col-start-1 bg-cornflower-500 border-t px-1 text-right`}
      >
        {props.hour}:00
      </p>
      <div className="col-start-2 col-span-full bg-white border-t"></div>
    </div>
  );
};

export default PlannerSchedule;
