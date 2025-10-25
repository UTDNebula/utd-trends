import { Popover } from '@mui/material';
import React, { useState } from 'react';

import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import type { SectionsData } from '@/modules/fetchSections';
import type { SearchQuery } from '@/types/SearchQuery';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
} from '@/types/SearchQuery';

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
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

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
        onSectionClick={(course, sectionNumber, event) => {
          const targetElement = event?.currentTarget as HTMLElement;
          setPopoverAnchor(targetElement);
        }}
      />

      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={() => setPopoverAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: {
            backgroundColor: 'black',
          },
        }}
      >
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
              scoot={1}
              key={`preview-${searchQueryLabel(removeSection(previewCourse))}-${section._id}-${index}`}
              nooffset={true}
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
                setPopoverAnchor(null); // Close popover after selection
              }}
            />
          );
        })}
      </Popover>
    </>
  );
}
