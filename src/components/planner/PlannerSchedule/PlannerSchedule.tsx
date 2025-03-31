import React from 'react';

import { type GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import {
  removeSection,
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import { type SectionsType } from '@/modules/SectionsType/SectionsType';

import PlannerSection from './PlannerSection';

// hours shown (24-hour time)
export const START_HOUR = 8;
export const END_HOUR = 22;
// days shown (0 = sunday -> 6 = Saturday)
// NOTE: IF YOU CHANGE THESE PLEASE ALSO CHANGE THE REPEAT NUMBERS (5 and 13)
//        IN THE TAILWIND CSS GRID SPECIFICATION (outer div in PlannerSchedule)
export const START_DAY = 1;
export const END_DAY = 6;
export const numHours = END_HOUR - START_HOUR;
export const numDays = END_DAY - START_DAY;
export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type PlannerScheduleProps = {
  courses: SearchQuery[];
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
};

const PlannerSchedule = (props: PlannerScheduleProps) => {
  //const PlannerCoursesTable = () => {

  const colors = [
    { fill: '#FFA6C2', outline: '#FEC2D5', font: '#780909' },
    { fill: '#D4A6E2', outline: '#DEBDE8', font: '#590972' },
    { fill: '#93BDFF', outline: '#B1CFFF', font: '#0E397C' },
    { fill: '#E9D0AC', outline: '#FFECD0', font: '#5D3804' },
    { fill: '#7BD6DD', outline: '#A2F4FA', font: '#034F55' },
    { fill: '#89EDAF', outline: '#B0FBCD', font: '#335600' },
    { fill: '#E5DAFF', outline: '#FBF9FF', font: '#483080' },
    { fill: '#F9C28A', outline: '#FFCDB7', font: '#611F00' },
    { fill: '#9FF9C9', outline: '#BFFFDD', font: '#005025' },
  ];

  return (
    <div
      className={`w-full h-[calc(140vh-2rem)] grid grid-flow-row grid-cols-[max-content_repeat(6,minmax(0,1fr))] overflow-scroll rounded-2xl grid-rows-[max-content_repeat(14,minmax(0,1fr))]`}
    >
      {/*Weekday Headers*/}
      <div className="grid col-span-full grid-flow-row bg-cornflower-500 grid-cols-subgrid grid-rows-subgrid">
        <div className="col-span-1 h-min"></div>
        {DAYS.slice(START_DAY, END_DAY + 1).map((x, i) => (
          <p
            key={i}
            className="text-sm col-span-1 border-l text-center h-min overflow-hidden"
          >
            {x}
          </p>
        ))}
      </div>
      {/*Times on the side*/}
      {[...Array(numHours)].map((x, i) => (
        <HourRow key={i} hour={i + START_HOUR} />
      ))}

      {props.courses.map((course, i) => {
        const sections =
          props.sections[searchQueryLabel(removeSection(course))];
        if (sections.state !== 'done') {
          return null;
        }
        return (
          <PlannerSection
            key={searchQueryLabel(course)}
            selectedSection={sections.data.latest.find(
              (section) => section.section_number === course.sectionNumber,
            )}
            course={course}
            color={colors[i % 9]}
          />
        );
      })}
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
      className={`grid row-span-1 row-start-[var(--row-start-row)] col-span-full grid-rows-subgrid grid-cols-subgrid`}
    >
      <p
        className={`text-sm col-span-1 col-start-1 bg-cornflower-300 border-t px-1 text-right`}
      >
        {props.hour}:00
      </p>
      <div className="col-start-2 col-span-full bg-white dark:bg-black border-t border-gray-300 dark:border-gray-600">
        <div className="relative top-1/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
        <div className="relative top-1/2 col-span-full border-t border-gray-200 dark:border-gray-700"></div>
        <div className="relative top-3/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
      </div>
    </div>
  );
};

export default PlannerSchedule;
