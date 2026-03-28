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
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
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

  // Fetch data for all planner queries
  const allResults = useSearchresults(planner);

  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === latestSemester && s != null,
        )
      : [],
  );

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

  const lectureSections = courseOnlySections.filter(
    (s) => !sectionCanOverlap(s.section_number),
  );
  const labSections = courseOnlySections.filter((s) =>
    sectionCanOverlap(s.section_number, 'extra'),
  );
  const examSections = courseOnlySections.filter((s) =>
    sectionCanOverlap(s.section_number, 'exam'),
  );

  const fitSections = (arr: typeof courseOnlySections) =>
    arr.filter((s) => !hasConflict(s, selectedSections));

  const lectureFit = fitSections(lectureSections);
  const labFit = fitSections(labSections);
  const examFit = fitSections(examSections);

  // "Should be" proxy: if this course ever has these section types
  const requiresLab = searchResult.sections.some((s) =>
    sectionCanOverlap(s.section_number, 'extra'),
  );
  const requiresExam = searchResult.sections.some((s) =>
    sectionCanOverlap(s.section_number, 'exam'),
  );

  const hasRequiredExtrasAvailable =
    (!requiresLab || labFit.length > 0) &&
    (!requiresExam || examFit.length > 0);

  const finalDisplayCount = hasRequiredExtrasAvailable ? lectureFit.length : 0;

  return (
    <Tooltip
      title={
        searchResult.type === 'professor'
          ? 'Cannot add professor to planner'
          : hasLatestSemester
            ? inPlanner
              ? `Remove from Planner (${finalDisplayCount} sections)`
              : finalDisplayCount > 0
                ? `${finalDisplayCount} section(s) fit your schedule!`
                : 'No Sections Available'
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
          icon={
            finalDisplayCount > 0 ? (
              <EventAvailableIcon />
            ) : (
              <BookOutlinedIcon />
            )
          }
          checkedIcon={<BookIcon />}
          disabled={!hasLatestSemester || searchResult.type === 'professor'}
        />
      </span>
    </Tooltip>
  );
}
