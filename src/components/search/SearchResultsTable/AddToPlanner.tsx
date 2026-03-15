import { useSharedState } from '@/app/SharedStateProvider';
import { hasConflict } from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { fetchSearchResult } from '@/modules/fetchSearchResult';
import { useSearchresults } from '@/modules/plannerFetch';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  searchQueryEqual,
  searchQueryLabel,
  searchQueryMultiSectionSplit,
  sectionCanOverlap,
  type SearchResult,
} from '@/types/SearchQuery';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import { Badge, Checkbox, Tooltip } from '@mui/material';
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

  const availableSections = searchResult.sections.filter(
    (s) =>
      s.academic_session.name === latestSemester &&
      !/^[7]/.test(s.section_number),
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

  // Fetch data for all planner queries
  const allResults = useSearchresults(planner);

  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) =>
            s.academic_session.name === latestSemester &&
            !/^[7]/.test(s.section_number),
        )
      : [],
  );

  const selectedSections = planner
    .map((searchQuery) => searchQueryMultiSectionSplit(searchQuery))
    .flatMap((queries, idx) => {
      return queries.map((query) => {
        return latestSections[idx]?.find(
          (section) => section.section_number === query.sectionNumber,
        );
      });
    })
    .filter((section) => typeof section !== 'undefined');

  const sectionsThatFitPlannerSchedule = availableSections.filter((section) => {
    return !hasConflict(section, selectedSections); // Keep sections with no conflicts
  });

  return sectionsThatFitPlannerSchedule.length > 0 ? (
    <Badge color="secondary" badgeContent=" ">
      <Tooltip
        title={
          searchResult.type === 'professor'
            ? 'Cannot add professor to planner'
            : hasLatestSemester
              ? inPlanner
                ? `Remove from Planner (${sectionsThatFitPlannerSchedule.length} sections)`
                : `${sectionsThatFitPlannerSchedule.length} section(s) fit your schedule!`
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
                      convertToProfOnly(
                        removeSection(searchResult.searchQuery),
                      ),
                    ),
                  ],
                  queryFn: async () => {
                    const data = await fetchSearchResult(
                      convertToProfOnly(
                        removeSection(searchResult.searchQuery),
                      ),
                    );
                    return data;
                  },
                });
              }
            }}
            icon={<BookOutlinedIcon />}
            checkedIcon={<BookIcon />}
            disabled={!hasLatestSemester || searchResult.type === 'professor'}
          />
        </span>
      </Tooltip>
    </Badge>
  ) : (
    <Tooltip
      title={
        searchResult.type === 'professor'
          ? 'Cannot add professor to planner'
          : hasLatestSemester
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
          disabled={!hasLatestSemester || searchResult.type === 'professor'}
        />
      </span>
    </Tooltip>
  );
}
