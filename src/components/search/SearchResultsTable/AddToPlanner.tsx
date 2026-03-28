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

  // Extract base number from section (last 2-3 digits: "01", "02", etc.)
  const getBaseSectionNumber = (sectionNum: string): string => {
    const match = sectionNum.match(/(\d{2,3})$/);
    return match ? match[1] : '';
  };

  // Separate by type using correct section codes
  const lectureSections = courseOnlySections.filter((s) =>
    /^[05]/.test(s.section_number) || /^0[WHL]/.test(s.section_number) || /^(HON|HN)/.test(s.section_number)
  );
  const labSections = courseOnlySections.filter((s) =>
    /^[1236]/.test(s.section_number)
  );
  const examSections = courseOnlySections.filter((s) =>
    /^7/.test(s.section_number)
  );

  const fitSections = (arr: typeof courseOnlySections) =>
    arr.filter((s) => !hasConflict(s, selectedSections));

  let finalDisplayCount = 0;

  if (lectureSections.length > 0) {
    // count lecture based sections
    const lecturesFitWithRequiredCompanions = lectureSections.filter((lecture) => {
      const base = getBaseSectionNumber(lecture.section_number);
      if (!base) return true;

      const courseHasLabs = labSections.length > 0;
      const courseHasExams = examSections.length > 0;

      if (courseHasLabs) {
        const matchingLab = labSections.find((l) => getBaseSectionNumber(l.section_number) === base);
        if (matchingLab && fitSections([matchingLab]).length === 0) {
          return false;
        }
      }

      if (courseHasExams) {
        const matchingExam = examSections.find((e) => getBaseSectionNumber(e.section_number) === base);
        if (matchingExam && fitSections([matchingExam]).length === 0) {
          return false;
        }
      }

      return true;
    });

    finalDisplayCount = lecturesFitWithRequiredCompanions.length;


  } else if (labSections.length > 0) {
    // Count for lab only sections
    const labsFitWithRequiredCompanions = labSections.filter((lab) => {
      const base = getBaseSectionNumber(lab.section_number);
      if (!base) return true;

      const courseHasExams = examSections.length > 0;

      if (courseHasExams) {
        const matchingExam = examSections.find((e) => getBaseSectionNumber(e.section_number) === base);
        if (matchingExam && fitSections([matchingExam]).length === 0) {
          return false;
        }
      }

      return true;
    });
    finalDisplayCount = labsFitWithRequiredCompanions.length;
  }

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
                : 'No sections fit in your schedule'
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
