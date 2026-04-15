import { useSharedState } from '@/app/SharedStateProvider';
import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import {
  convertToCourseOnly,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import React from 'react';

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

interface HourRowProps {
  key: number;
  hour: number;
}

export function LoadingPlannerSchedule() {
  return (
    <div
      className={`w-full h-[calc(100vh-2rem)] grid grid-flow-row grid-cols-[max-content_repeat(6,minmax(0,1fr))] overflow-auto rounded-2xl grid-rows-[max-content_repeat(14,minmax(0,1fr))] animate-pulse`}
    >
      {/*Weekday Headers*/}
      <div className="grid col-span-full grid-flow-row bg-neutral-300 dark:bg-neutral-800 grid-cols-subgrid grid-rows-subgrid">
        <div className="col-span-1 h-min"></div>
        {DAYS.slice(START_DAY, END_DAY + 1).map((x, i) => (
          <div
            key={i}
            className="col-span-1 border-l border-gray-400 dark:border-gray-700 text-center h-min overflow-hidden"
          >
            <p className="text-sm text-transparent rounded px-2">{x}</p>
          </div>
        ))}
      </div>
      {/*Times on the side*/}
      {[...Array(numHours)].map((x, i) => {
        const hour = i + START_HOUR;
        // a loading <HourRow />
        return (
          <div
            key={i}
            style={
              {
                '--row-start-row': i + 2,
              } as React.CSSProperties
            }
            className={`grid row-span-1 row-start-[var(--row-start-row)] col-span-full grid-rows-subgrid grid-cols-subgrid`}
          >
            <div
              className={`col-span-1 col-start-1 bg-neutral-300 dark:bg-neutral-800 border-t border-gray-400 dark:border-gray-700 px-1 text-right`}
            >
              <p className="text-[0.8125rem] text-transparent rounded px-1">
                {hour > 12 ? hour - 12 : hour}:00
                {hour >= 12 ? 'PM' : 'AM'}
              </p>
            </div>
            <div className="col-start-2 col-span-full bg-neutral-100 dark:bg-neutral-900 border-t border-gray-300 dark:border-gray-700">
              <div className="relative top-1/4 col-span-full border-t border-gray-200 dark:border-gray-800"></div>
              <div className="relative top-1/2 col-span-full border-t border-gray-300 dark:border-gray-700"></div>
              <div className="relative top-3/4 col-span-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HourRow(props: HourRowProps) {
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
        className={`text-[0.8125rem] text-white dark:text-haiti col-span-1 col-start-1 bg-royal dark:bg-cornflower-300 border-t px-1 text-right`}
      >
        {props.hour > 12 ? props.hour - 12 : props.hour}:00
        {props.hour >= 12 ? 'PM' : 'AM'}
      </p>
      <div className="col-start-2 col-span-full bg-light dark:bg-dark border-t border-gray-300 dark:border-gray-600">
        <div className="relative top-1/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
        <div className="relative top-1/2 col-span-full border-t border-gray-200 dark:border-gray-700"></div>
        <div className="relative top-3/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
      </div>
    </div>
  );
}

export default function PlannerSchedule() {
  const { planner, plannerColorMap, effectiveTeachingSemester } =
    useSharedState();

  const plannerForSemester = planner.filter(
    (entry) => entry.semester === effectiveTeachingSemester,
  );
  const courses = plannerForSemester.flatMap((entry) =>
    searchQueryMultiSectionSplit(entry.query),
  );

  return (
    <div
      className={`w-full h-[calc(100vh-2rem)] grid grid-flow-row grid-cols-[max-content_repeat(6,minmax(0,1fr))] overflow-auto rounded-2xl grid-rows-[max-content_repeat(14,minmax(0,1fr))]`}
    >
      {/*Weekday Headers*/}
      <div className="grid col-span-full grid-flow-row bg-royal dark:bg-cornflower-300 grid-cols-subgrid grid-rows-subgrid">
        <div className="col-span-1 h-min"></div>
        {DAYS.slice(START_DAY, END_DAY + 1).map((x, i) => (
          <p
            key={i}
            className="text-sm text-white dark:text-haiti col-span-1 border-l text-center h-min overflow-hidden"
          >
            {x}
          </p>
        ))}
      </div>
      {/*Times on the side*/}
      {[...Array(numHours)].map((x, i) => (
        <HourRow key={i} hour={i + START_HOUR} />
      ))}

      {courses.map((course) => {
        if (!course.sectionNumber) return null;
        return (
          <PlannerSection
            key={searchQueryLabel(course)}
            selectedSection={course.sectionNumber}
            course={course}
            color={
              plannerColorMap[searchQueryLabel(convertToCourseOnly(course))]
            }
          />
        );
      })}
    </div>
  );
}
