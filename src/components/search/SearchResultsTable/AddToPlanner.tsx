import { useSharedState } from '@/app/SharedStateProvider';
import { fetchSearchResult } from '@/modules/fetchSearchResult';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  searchQueryEqual,
  searchQueryLabel,
  sectionCanOverlap,
  type SearchResult,
} from '@/types/SearchQuery';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { Checkbox, Tooltip } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

type addToPlannerProps = {
  searchResult: SearchResult;
};

export default function AddToPlanner({ searchResult }: addToPlannerProps) {
  const sections = searchResult.sections;
  const { latestSemester, planner, addToPlanner, removeFromPlanner } =
    useSharedState();
  // Check if the course section has the latest semester data
  const hasLatestSemester = sections.some(
    (s) => s.academic_session.name === latestSemester,
  );
  const queryClient = useQueryClient();
  const inPlanner = planner.some((obj) =>
    searchQueryEqual(obj, searchResult.searchQuery),
  );

  const courseOnlySections = searchResult.sections.filter(
    (s) => s.academic_session.name === latestSemester,
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
              removeFromPlanner(searchResult.searchQuery);
            } else {
              addToPlanner(searchResult.searchQuery);
              if (addJustCourseToo) {
                addToPlanner(convertToCourseOnly(searchResult.searchQuery));
              }
              queryClient.prefetchQuery({
                queryKey: [
                  'results',
                  searchQueryLabel(
                    convertToCourseOnly(
                      removeSection(searchResult.searchQuery),
                    ),
                  ),
                ],
                queryFn: async () => {
                  const data = await fetchSearchResult(
                    convertToCourseOnly(searchResult.searchQuery),
                  );
                  return data;
                },
              });
              queryClient.prefetchQuery({
                queryKey: [
                  'rmp',
                  searchQueryLabel(
                    convertToProfOnly(removeSection(searchResult.searchQuery)),
                  ),
                ],
                queryFn: async () => {
                  const data = await fetchSearchResult(
                    convertToProfOnly(removeSection(searchResult.searchQuery)),
                  );
                  return data;
                },
              });
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
