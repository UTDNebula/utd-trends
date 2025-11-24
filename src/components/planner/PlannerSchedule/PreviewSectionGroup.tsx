import { Popover } from '@mui/material';
import React, { useState } from 'react';

import PlannerSection from '@/components/planner/PlannerSchedule/PlannerSection';
import type { SectionsData } from '@/modules/fetchSections';
import type { SearchQuery } from '@/types/SearchQuery';
import {
  convertToCourseOnly,
  removeSection,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import { useSearchresults } from '@/modules/plannerFetch';
import { useSharedState } from '@/app/SharedStateProvider';

interface PreviewSectionGroupProps {
  sectionGroup: SectionsData;
  plannerColorMap: Record<
    string,
    { fill: string; outline: string; font: string }
  >;
  showConflictMessage: () => void;
  index: number;
  scoot?: number;
}

export default function PreviewSectionGroup({
  sectionGroup,
  plannerColorMap,
  showConflictMessage,
  index,
  scoot = 0,
}: PreviewSectionGroupProps) {
  const { setPlannerSection } = useSharedState();
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  // get the selected sections
  const { planner, latestSemester } = useSharedState();
  const allResults = useSearchresults(planner);
  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === latestSemester,
        )
      : [],
  ); // all the sections for each course in the planner for the latest semester

  const firstSection = sectionGroup[0];
  if (!firstSection) {
    return null;
  }

  const previewFirstCourseWithSection = {
    prefix:
      firstSection.course_details && firstSection.course_details[0]
        ? firstSection.course_details[0].subject_prefix
        : null,
    number:
      firstSection.course_details && firstSection.course_details[0]
        ? firstSection.course_details[0].course_number
        : null,
    profFirst:
      firstSection.professor_details && firstSection.professor_details[0]
        ? firstSection.professor_details[0].first_name
        : null,
    profLast:
      firstSection.professor_details && firstSection.professor_details[0]
        ? firstSection.professor_details[0].last_name
        : null,
    sectionNumber: firstSection.section_number,
  } as SearchQuery;

  const courseKey = searchQueryLabel(
    convertToCourseOnly(previewFirstCourseWithSection),
  );
  const color = plannerColorMap[courseKey];

  const selectedSections = planner
    .map((searchQuery) => searchQueryMultiSectionSplit(searchQuery))
    .flatMap((queries, idx) => {
      return queries.map((query) => {
        return latestSections[idx].find(
          (section) => section.section_number === query.sectionNumber,
        );
      });
    })
    .filter((section) => typeof section !== 'undefined');

  return (
    <>
      <PlannerSection
        key={`preview-${searchQueryLabel(removeSection(previewFirstCourseWithSection))}-${firstSection._id}-${index}`}
        nooffset={false}
        placeholder={true}
        sectionNumber={firstSection.section_number}
        course={previewFirstCourseWithSection}
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
        {sectionGroup.map((section) => {
          const previewCourseWithSection = {
            prefix:
              section.course_details && section.course_details[0]
                ? section.course_details[0].subject_prefix
                : null,
            number:
              section.course_details && section.course_details[0]
                ? section.course_details[0].course_number
                : null,
            profFirst:
              section.professor_details && section.professor_details[0]
                ? section.professor_details[0].first_name
                : null,
            profLast:
              section.professor_details && section.professor_details[0]
                ? section.professor_details[0].last_name
                : null,
            sectionNumber: section.section_number,
          } as SearchQuery;

          const courseKey = searchQueryLabel(
            convertToCourseOnly(previewCourseWithSection),
          );
          const color = plannerColorMap[courseKey];

          return (
            <PlannerSection
              key={`preview-${searchQueryLabel(removeSection(previewCourseWithSection))}-${section._id}-${index}`}
              nooffset={true}
              sectionNumber={section.section_number}
              course={previewCourseWithSection}
              color={color}
              isPreview={true}
              onSectionClick={() => {
                setPlannerSection(
                  section,
                  selectedSections,
                  selectedSections.some(
                    (s) =>
                      s.section_number === section.section_number &&
                      s.course_details?.[0].subject_prefix ===
                        section.course_details?.[0].subject_prefix &&
                      s.course_details?.[0].course_number ===
                        section.course_details?.[0].course_number,
                  ),
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
