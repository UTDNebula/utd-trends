import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { Checkbox, Tooltip } from '@mui/material';
import React from 'react';

import type { Sections } from '@/modules/fetchSections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { convertToCourseOnly, type SearchQuery } from '@/types/SearchQuery';

type PlannerCheckboxProps = {
  section: GenericFetchedData<Sections>;
  course: SearchQuery;
  inPlanner: boolean;
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  addJustCourseToo: boolean;
};

export default function PlannerCheckbox({
  section,
  course,
  inPlanner,
  addToPlanner,
  removeFromPlanner,
  addJustCourseToo,
}: PlannerCheckboxProps) {
  const hasLatestSemester = !!(
    typeof section !== 'undefined' &&
    section.message === 'success' &&
    section.data.latest.length
  );

  return (
    <Tooltip
      title={
        hasLatestSemester
          ? inPlanner
            ? 'Remove from Planner'
            : 'Add to Planner'
          : 'Not being taught'
      }
      placement="top"
    >
      <span>
        <Checkbox
          checked={inPlanner}
          onClick={(e) => {
            e.stopPropagation(); // prevents opening/closing the card when clicking on the compare checkbox
            if (inPlanner) {
              removeFromPlanner(course);
            } else {
              addToPlanner(course);
              if (addJustCourseToo) {
                addToPlanner(convertToCourseOnly(course));
              }
            }
          }}
          icon={<BookOutlinedIcon />}
          checkedIcon={<BookIcon />}
          disabled={!hasLatestSemester}
        />
      </span>
    </Tooltip>
  );
}
