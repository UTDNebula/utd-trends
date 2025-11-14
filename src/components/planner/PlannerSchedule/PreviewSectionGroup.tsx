import { Popover } from '@mui/material';
import React, { useState } from 'react';

import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import type { SectionsData } from '@/modules/fetchSections';
import type { SearchQuery, SearchQueryMultiSection } from '@/types/SearchQuery';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
} from '@/types/SearchQuery';

interface PreviewSectionGroupProps {
  sectionGroup: SearchQueryMultiSection;
  previewCourse: SearchQuery;
  courseNames: Record<string, string | undefined>;
  plannerColorMap: Record<
    string,
    { fill: string; outline: string; font: string }
  >;
  setPlannerSection: (
    course: SearchQuery,
    sectionNumber: string
  ) => void;
  showConflictMessage: () => void;
  index: number;
  scoot?: number;
}

export default function PreviewSectionGroup({
  sectionGroup,
  previewCourse,
  courseNames,
  plannerColorMap,
  setPlannerSection,
  showConflictMessage,
  index,
  scoot = 0,
}: PreviewSectionGroupProps) {
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  const firstSectionNumber = sectionGroup?.sectionNumbers? sectionGroup?.sectionNumbers[0] : null;
  if (!firstSectionNumber) {
    return null;
  }

  const previewCourseWithSection = {
    ...previewCourse,
    sectionNumber: firstSectionNumber,
  };
  const courseKey = searchQueryLabel(
    convertToCourseOnly(previewCourseWithSection),
  );
  const properCourseName = courseNames[courseKey];
  const color = plannerColorMap[courseKey];
  return (
    <>
      <PlannerSection
        key={`preview-${searchQueryLabel(removeSection(previewCourse))}-${index}`}
        nooffset={false}
        placeholder={true}
        selectedSection={firstSectionNumber}
        course={previewCourseWithSection}
        color={color}
        isPreview={true}
        scoot={scoot}
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
        {sectionGroup.sectionNumbers?.map((section) => {
          const previewCourseWithSection = {
            ...previewCourse,
            sectionNumber: section,
          };
          const courseKey = searchQueryLabel(
            convertToCourseOnly(previewCourseWithSection),
          );
          const properCourseName = courseNames[courseKey];
          const color = plannerColorMap[courseKey];

          return (
            <PlannerSection
              key={`preview-${searchQueryLabel(removeSection(previewCourse))}-${index}`}
              nooffset={true}
              selectedSection={section}
              course={previewCourseWithSection}
              color={color}
              isPreview={true}
              onSectionClick={(course, sectionNumber) => {
                setPlannerSection(
                  course,
                  sectionNumber
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
