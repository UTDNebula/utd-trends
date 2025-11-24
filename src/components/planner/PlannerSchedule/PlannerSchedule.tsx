import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import { useSnackbar } from '@/contexts/SnackbarContext';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
  type SearchQuery,
} from '@/types/SearchQuery';
import type { SectionsData } from '@/modules/fetchSections';
import { parseTime } from '@/modules/timeUtils';
import { useSearchResult, useSearchresults } from '@/modules/plannerFetch';
import PreviewSectionGroup from './PreviewSectionGroup';

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
  const { planner, plannerColorMap, previewCourses, setPlannerSection, latestSemester } = useSharedState();

  const courses = planner.flatMap((searchQuery) =>
    searchQueryMultiSectionSplit(searchQuery),
  );
  const { showConflictMessage } = useSnackbar();

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
        if (!course.sectionNumber) return null;
        return (
          <PlannerSection
            key={searchQueryLabel(course)}
            scoot={0}
            sectionNumber={course.sectionNumber}
            course={course}
            color={
              plannerColorMap[searchQueryLabel(convertToCourseOnly(course))]
            }
          />
        );
      })}

      {/* Preview Sessions Overlay */}
      {(() => {
        // Collect all sections from all courses into a flat array
        const allSections : SectionsData = [];

        const allResults = useSearchresults(planner);
        const latestSections = allResults.map((r) =>
          r.isSuccess
            ? r.data.sections.filter(
                (s) => s.academic_session.name === latestSemester,
              )
            : [],
        ); // all the sections for each course in the planner for the latest semester

        const selectedSections = planner
            .map((searchQuery) =>
              searchQueryMultiSectionSplit(searchQuery),
            )
            .flatMap((queries, idx) => {
              return queries.map((query) => {
                return latestSections[idx].find(
                  (section) =>
                    section.section_number === query.sectionNumber,
                );
              });
            })
            .filter((section) => typeof section !== 'undefined')
          

        previewCourses.forEach((previewCourse) => {
          
          // filter out sections that are already selected
          const filteredSections : SectionsData = latestSections.flatMap((s) => s).filter((sec, idx, self) => self.findIndex((s) => sec._id == s._id) == idx)
            .filter((section) => (section.course_details && section.course_details[0] && section.course_details[0].subject_prefix === previewCourse.prefix && section.course_details[0].course_number === previewCourse.number) && (previewCourse.profFirst && section.professor_details && section.professor_details.find((p) => p.first_name == previewCourse.profFirst && p.last_name == previewCourse.profLast)))
            .filter( // not same section
              (section) =>
                !selectedSections.find((s) => (s.section_number == section.section_number) && (s.course_details && s.course_details[0] && section.course_details && section.course_details[0] && s.course_details[0].subject_prefix == section.course_details[0].subject_prefix && s.course_details[0].course_number == section.course_details[0].course_number)),
            )
            // TODO: re-enable conflict detection perchance
            // .filter((section) => {
            //   const selectedSections = getSelectedSections(planner, sections);
            //   return !hasConflict(section, selectedSections);
            // });

          // Add all sections to the flat array
          filteredSections.forEach((section) => {
            allSections.find((s) => s._id == section._id) === undefined &&
            allSections.push(section);
          });
        });

        // Now group the flat array by meeting times
        const groupedSections = Object.values(
          allSections.reduce(
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
            {} as Record<
              string,
              SectionsData
            >,
          ),
        );

        // Add scoot logic: scoot later sections right.
        const sectionsWithScoot = groupedSections
          .sort((a, b) => {
            const timeA = a[0].meetings[0]?.start_time || '';
            const timeB = b[0].meetings[0]?.start_time || '';
            const daysA = a[0].meetings[0]?.meeting_days || [];
            const daysB = b[0].meetings[0]?.meeting_days || [];

            // Convert to comparable format (24-hour) with weekday consideration
            return parseTime(timeA, daysA) - parseTime(timeB, daysB);
          })
          .map((sectionGroup, index, self) => {
            // Calculate scoot value based on overlapping times
            let scootCounter = 0;

            const currentSection = sectionGroup[0];
            const currentStartTime = currentSection?.meetings[0]?.start_time;
            const currentDays = currentSection?.meetings[0]?.meeting_days || [];

            // iterate through sections by start time.
            // basically scoot ="number of sections overlapping with the current section"
            // when we come across a start, scootCounter++
            // when we come across an end, scootCounter--
            for (let i = 0; i < index; i++) {
              const prevSection = self[i][0];
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
          const courseKey = (firstItem.course_details && firstItem.course_details[0] ? firstItem.course_details[0].subject_prefix + ' ' + firstItem.course_details[0].course_number : '') + (firstItem.professor_details && firstItem.professor_details[0] ? ' ' + firstItem.professor_details.map((p) => p.first_name + ' ' + p.last_name).join(' ') : '');

          if (sectionGroup.length > 1) { // need a preview section group
            return (
              <PreviewSectionGroup
                key={`preview-group-${courseKey}-${index}`}
                sectionGroup={sectionGroup}
                plannerColorMap={plannerColorMap}
                showConflictMessage={showConflictMessage}
                index={index}
                scoot={scoot}
              />
            );
          } else { // single preview section
            const section = sectionGroup[0];
            const previewCourseWithSection = {
              prefix: section.course_details && section.course_details[0] ? section.course_details[0].subject_prefix : null,
              number: section.course_details && section.course_details[0] ? section.course_details[0].course_number : null,
              profFirst: section.professor_details && section.professor_details[0] ? section.professor_details[0].first_name : null,
              profLast: section.professor_details && section.professor_details[0] ? section.professor_details[0].last_name : null,
              sectionNumber: section.section_number,
            } as SearchQuery;
            const courseKey = searchQueryLabel(
              convertToCourseOnly(previewCourseWithSection),
            );
            const color = plannerColorMap[courseKey];

            return (
              <PlannerSection
                key={`preview-single-${searchQueryLabel(removeSection(previewCourseWithSection))}-${section?._id}-${index}`}
                sectionNumber={section.section_number}
                course={previewCourseWithSection}
                color={color}
                isPreview={true}
                scoot={scoot}
                onSectionClick={(course, sectionNumber) => {
                  setPlannerSection(
                    section,
                    selectedSections,
                    selectedSections.some((s) => s.section_number === section.section_number && s.course_details?.[0].subject_prefix === section.course_details?.[0].subject_prefix && s.course_details?.[0].course_number === section.course_details?.[0].course_number),
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
