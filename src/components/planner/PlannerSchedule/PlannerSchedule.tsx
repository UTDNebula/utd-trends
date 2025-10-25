import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import PreviewSectionGroup from '@/components/planner/PlannerSchedule/PreviewSectionGroup';
import { useSnackbar } from '@/contexts/SnackbarContext';
import type { SectionsData } from '@/modules/fetchSections';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';

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
        className={`text-[0.8125rem] text-white col-span-1 col-start-1 bg-cornflower-300 border-t px-1 text-right`}
      >
        {props.hour > 12 ? props.hour - 12 : props.hour}:00
        {props.hour >= 12 ? 'PM' : 'AM'}
      </p>
      <div className="col-start-2 col-span-full bg-white dark:bg-black border-t border-gray-300 dark:border-gray-600">
        <div className="relative top-1/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
        <div className="relative top-1/2 col-span-full border-t border-gray-200 dark:border-gray-700"></div>
        <div className="relative top-3/4 col-span-full border-t border-gray-100 dark:border-gray-800"></div>
      </div>
    </div>
  );
}

export default function PlannerSchedule() {
  const {
    sections,
    planner,
    plannerColorMap,
    courseNames,
    previewCourses,
    setPlannerSection,
    hasConflict,
    getSelectedSections,
  } = useSharedState();
  const { showConflictMessage } = useSnackbar();

  const courses = planner.flatMap((searchQuery) =>
    searchQueryMultiSectionSplit(searchQuery),
  );

  return (
    <div
      className={`w-full h-[calc(100vh-2rem)] grid grid-flow-row grid-cols-[max-content_repeat(6,minmax(0,1fr))] overflow-scroll rounded-2xl grid-rows-[max-content_repeat(14,minmax(0,1fr))]`}
    >
      {/*Weekday Headers*/}
      <div className="grid col-span-full grid-flow-row bg-cornflower-500 grid-cols-subgrid grid-rows-subgrid">
        <div className="col-span-1 h-min"></div>
        {DAYS.slice(START_DAY, END_DAY + 1).map((x, i) => (
          <p
            key={i}
            className="text-sm text-white col-span-1 border-l text-center h-min overflow-hidden"
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
        const courseSections =
          sections[searchQueryLabel(removeSection(course))];
        if (
          typeof courseSections === 'undefined' ||
          courseSections.message !== 'success'
        ) {
          return null;
        }
        return (
          <PlannerSection
            scoot={0}
            key={searchQueryLabel(course)}
            selectedSection={courseSections.data.latest.find(
              (section) => section.section_number === course.sectionNumber,
            )}
            course={course}
            color={
              plannerColorMap[searchQueryLabel(convertToCourseOnly(course))]
            }
            courseName={
              courseNames[searchQueryLabel(convertToCourseOnly(course))]
            }
          />
        );
      })}

      {/* Preview Sessions Overlay */}
      {previewCourses.flatMap((previewCourse) => {
        const courseSections =
          sections[searchQueryLabel(removeSection(previewCourse))];
        if (
          typeof courseSections === 'undefined' ||
          courseSections.message !== 'success'
        ) {
          return [];
        }
        // filter out sections that are already in the planner
        const selectedSectionNumbers = planner
          .flatMap((searchQuery) => searchQueryMultiSectionSplit(searchQuery))
          .map((course) => course.sectionNumber)
          .filter(Boolean);

        const filteredSections = Object.values(
          courseSections.data.latest
            .filter(
              (section) =>
                !selectedSectionNumbers.includes(section.section_number),
            )
            .filter((section) => {
              const selectedSections = getSelectedSections(planner, sections);
              return !hasConflict(section, selectedSections);
            })
            // group sections by the same meeting times
            .reduce(
              (acc, section) => {
                const key = section.meetings
                  .map(
                    (meeting) =>
                      meeting.meeting_days.sort().join(',') +
                      meeting.start_time +
                      meeting.end_time,
                  )
                  .join('-');
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(section);
                return acc;
              },
              {} as Record<string, SectionsData>,
            ),
        );

        const individualSections = filteredSections.flatMap(
          (sectionGroup, index) => {
            const courseKey = searchQueryLabel(removeSection(previewCourse));

            if (sectionGroup.length > 1) {
              return (
                <PreviewSectionGroup
                  key={`preview-group-${courseKey}-${index}`}
                  sectionGroup={sectionGroup}
                  previewCourse={previewCourse}
                  courseNames={courseNames}
                  plannerColorMap={plannerColorMap}
                  setPlannerSection={setPlannerSection}
                  showConflictMessage={showConflictMessage}
                  index={index}
                />
              );
            } else {
              const section = sectionGroup[0];
              const previewCourseWithSection = {
                ...previewCourse,
                sectionNumber: section.section_number,
              };
              const courseKey = searchQueryLabel(
                convertToCourseOnly(previewCourseWithSection),
              );
              const properCourseName = courseNames[courseKey];
              const color = plannerColorMap[courseKey];

              return (
                <PlannerSection
                  key={`preview-single-${searchQueryLabel(removeSection(previewCourse))}-${section._id}-${index}`}
                  selectedSection={section}
                  course={previewCourseWithSection}
                  color={color}
                  courseName={properCourseName}
                  isPreview={true}
                  onSectionClick={(course, sectionNumber) => {
                    setPlannerSection(
                      course,
                      sectionNumber,
                      section,
                      showConflictMessage,
                    );
                  }}
                />
              );
            }
          },
        );
        return individualSections;
      })}
    </div>
  );
}
