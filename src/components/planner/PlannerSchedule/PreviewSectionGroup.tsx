import React, { useState } from 'react';

import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import type { SectionsData } from '@/modules/fetchSections';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
} from '@/types/SearchQuery';
import type { SearchQuery } from '@/types/SearchQuery';

interface PreviewSectionGroupProps {
  sectionGroup: SectionsData;
  previewCourse: SearchQuery;
  courseNames: Record<string, string | undefined>;
  plannerColorMap: Record<
    string,
    { fill: string; outline: string; font: string }
  >;
  setPlannerSection: (
    course: SearchQuery,
    sectionNumber: string,
    section: SectionsData[number],
    showConflictMessage: () => void,
  ) => void;
  showConflictMessage: () => void;
  index: number;
}

export default function PreviewSectionGroup({
  sectionGroup,
  previewCourse,
  courseNames,
  plannerColorMap,
  setPlannerSection,
  showConflictMessage,
  index,
}: PreviewSectionGroupProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Only display the first section in the group
  const firstSection = sectionGroup[0];
  if (!firstSection) {
    return null;
  }

  const previewCourseWithSection = {
    ...previewCourse,
    sectionNumber: firstSection.section_number,
  };
  const courseKey = searchQueryLabel(
    convertToCourseOnly(previewCourseWithSection),
  );
  const properCourseName = courseNames[courseKey];
  const color = plannerColorMap[courseKey];
  return (
    <>
      <PlannerSection
        key={`preview-${searchQueryLabel(removeSection(previewCourse))}-${firstSection._id}-${index}`}
        nooffset={false}
        placeholder={true}
        selectedSection={firstSection}
        course={previewCourseWithSection}
        color={color}
        courseName={properCourseName}
        isPreview={true}
        onSectionClick={() => {
          setIsHovered(!isHovered);
        }}
        // onSectionHover={() => {
        //   setIsHovered(!isHovered);
        // }}
      />

      {isHovered && (
        <>
          {sectionGroup.map((section) => {
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
                key={`preview-${searchQueryLabel(removeSection(previewCourse))}-${section._id}-${index}`}
                nooffset={sectionGroup.length > 1 ? true : false}
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
          })}
        </>
      )}
    </>
  );
}
