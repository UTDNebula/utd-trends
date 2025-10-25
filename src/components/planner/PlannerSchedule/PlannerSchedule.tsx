import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import PreviewSectionGroup from '@/components/planner/PlannerSchedule/PreviewSectionGroup';
import { useSnackbar } from '@/contexts/SnackbarContext';
import type { SectionsData } from '@/modules/fetchSections';
import { parseTime } from '@/modules/timeUtils';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
  type SearchQuery,
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
      {(() => {
        // Collect all sections from all courses into a flat array
        const allSections: Array<{
          section: SectionsData[number];
          previewCourse: SearchQuery;
        }> = [];

        previewCourses.forEach((previewCourse) => {
          const courseSections =
            sections[searchQueryLabel(removeSection(previewCourse))];
          if (
            typeof courseSections === 'undefined' ||
            courseSections.message !== 'success'
          ) {
            return;
          }
          // filter out sections that are already in the planner
          const selectedSectionNumbers = planner
            .flatMap((searchQuery) => searchQueryMultiSectionSplit(searchQuery))
            .map((course) => course.sectionNumber)
            .filter(Boolean);

          const filteredSections = courseSections.data.latest
            .filter(
              (section) =>
                !selectedSectionNumbers.includes(section.section_number),
            )
            .filter((section) => {
              const selectedSections = getSelectedSections(planner, sections);
              return !hasConflict(section, selectedSections);
            });

          // Add all sections to the flat array
          filteredSections.forEach((section) => {
            allSections.push({
              section,
              previewCourse,
            });
          });
        });

        // Now group the flat array by meeting times
        const groupedSections = Object.values(
          allSections.reduce(
            (acc, { section, previewCourse }) => {
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
              acc[key].push({ section, previewCourse });
              return acc;
            },
            {} as Record<
              string,
              Array<{
                section: SectionsData[number];
                previewCourse: SearchQuery;
              }>
            >,
          ),
        );

        // Add scoot logic: scoot later sections right.
        const sectionsWithScoot = groupedSections
          .sort((a, b) => {
            const timeA = a[0]?.section?.meetings[0]?.start_time || '';
            const timeB = b[0]?.section?.meetings[0]?.start_time || '';
            const daysA = a[0]?.section?.meetings[0]?.meeting_days || [];
            const daysB = b[0]?.section?.meetings[0]?.meeting_days || [];

            // Convert to comparable format (24-hour) with weekday consideration

            return parseTime(timeA, daysA) - parseTime(timeB, daysB);
          })
          .map((sectionGroup, index) => {
            // Calculate scoot value based on overlapping times
            let scootCounter = 0;

            const currentSection = sectionGroup[0]?.section;
            const currentStartTime = currentSection?.meetings[0]?.start_time;
            const currentDays = currentSection?.meetings[0]?.meeting_days || [];

            // iterate through sections by start time.
            // basically scoot ="number of sections overlapping with the current section"
            // when we come across a start, scootCounter++
            // when we come across an end, scootCounter--
            for (let i = 0; i < index; i++) {
              const prevSection = groupedSections[i][0]?.section;
              const prevEndTime = prevSection?.meetings[0]?.end_time;
              const prevDays = prevSection?.meetings[0]?.meeting_days || [];

              if (prevEndTime && currentStartTime) {
                const prevEndMinutes = parseTime(prevEndTime, prevDays);
                const currentStartMinutes = parseTime(
                  currentStartTime,
                  currentDays,
                );

                // Check if sections meet on the same day and if there's overlap
                const hasCommonDay = prevDays.some((day) =>
                  currentDays.includes(day),
                );

                // If previous section hasn't ended yet and they meet on the same day, increment scoot
                if (hasCommonDay && prevEndMinutes > currentStartMinutes) {
                  scootCounter++;
                }
              }
            }

            return {
              sectionGroup,
              scoot: scootCounter,
            };
          });

        return sectionsWithScoot.flatMap(({ sectionGroup, scoot }, index) => {
          const firstItem = sectionGroup[0];
          const previewCourse = firstItem?.previewCourse;
          const courseKey = searchQueryLabel(removeSection(previewCourse));

          if (sectionGroup.length > 1) {
            return (
              <PreviewSectionGroup
                key={`preview-group-${courseKey}-${index}`}
                sectionGroup={sectionGroup.map((item) => item.section)}
                previewCourse={previewCourse}
                courseNames={courseNames}
                plannerColorMap={plannerColorMap}
                setPlannerSection={setPlannerSection}
                showConflictMessage={showConflictMessage}
                index={index}
                scoot={scoot}
              />
            );
          } else {
            const section = sectionGroup[0]?.section;
            const previewCourseWithSection = {
              ...previewCourse,
              sectionNumber: section?.section_number,
            };
            const courseKey = searchQueryLabel(
              convertToCourseOnly(previewCourseWithSection),
            );
            const properCourseName = courseNames[courseKey];
            const color = plannerColorMap[courseKey];

            return (
              <PlannerSection
                key={`preview-single-${searchQueryLabel(removeSection(previewCourse))}-${section?._id}-${index}`}
                selectedSection={section}
                course={previewCourseWithSection}
                color={color}
                courseName={properCourseName}
                isPreview={true}
                scoot={scoot}
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
        });
      })()}
    </div>
  );
}
