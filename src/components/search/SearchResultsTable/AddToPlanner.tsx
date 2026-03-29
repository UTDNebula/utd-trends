import { useSharedState } from '@/app/SharedStateProvider';
import {
  convertToCourseOnly,
  searchQueryEqual,
  sectionCanOverlap,
  type SearchResult,
} from '@/types/SearchQuery';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { Checkbox, Tooltip } from '@mui/material';

type addToPlannerProps = {
  searchResult: SearchResult;
};

export default function AddToPlanner({ searchResult }: addToPlannerProps) {
  const sections = searchResult.sections;
  const {
    effectiveTeachingSemester,
    planner,
    addToPlanner,
    removeFromPlanner,
  } = useSharedState();
  const hasSectionsForTeachingSemester = sections.some(
    (s) => s.academic_session.name === effectiveTeachingSemester,
  );

  const inPlanner = planner.some(
    (entry) =>
      searchQueryEqual(entry.query, searchResult.searchQuery) &&
      entry.semester === effectiveTeachingSemester,
  );

  const courseOnlySections = searchResult.sections.filter(
    (s) => s.academic_session.name === effectiveTeachingSemester,
  );
  const canAddCourseOnlyToPlanner =
    typeof courseOnlySections !== 'undefined' &&
    courseOnlySections.some((section) =>
      sectionCanOverlap(section.section_number),
    );
  const addJustCourseToo =
    !searchQueryEqual(
      searchResult.searchQuery,
      convertToCourseOnly(searchResult.searchQuery),
    ) && canAddCourseOnlyToPlanner;
  return (
    <Tooltip
      title={
        searchResult.type === 'professor'
          ? 'Cannot add professor to planner'
          : hasSectionsForTeachingSemester
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
              removeFromPlanner(
                searchResult.searchQuery,
                effectiveTeachingSemester,
              );
            } else {
              addToPlanner(searchResult.searchQuery, effectiveTeachingSemester);
              if (addJustCourseToo) {
                addToPlanner(
                  convertToCourseOnly(searchResult.searchQuery),
                  effectiveTeachingSemester,
                );
              }
            }
          }}
          icon={<BookOutlinedIcon />}
          checkedIcon={<BookIcon />}
          disabled={
            !hasSectionsForTeachingSemester || searchResult.type === 'professor'
          }
        />
      </span>
    </Tooltip>
  );
}
