import { useSharedState } from '@/app/SharedStateProvider';
import { hasConflict } from '@/components/planner/PlannerCoursesTable/PlannerCard';
import { useSearchresults } from '@/modules/plannerFetch';
import {
  convertToCourseOnly,
  searchQueryEqual,
  searchQueryMultiSectionSplit,
  sectionCanOverlap,
  type SearchResult,
} from '@/types/SearchQuery';
import BookIcon from '@mui/icons-material/Book';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Badge, Checkbox, Tooltip } from '@mui/material';

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

  // Fetch data for all planner queries
  const allResults = useSearchresults(planner.map((entry) => entry.query));

  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) =>
            s.academic_session.name === effectiveTeachingSemester && s != null,
        )
      : [],
  );

  const selectedSections = planner
    .map((plannerEntry) => searchQueryMultiSectionSplit(plannerEntry.query))
    .flatMap((queries, idx) => {
      return queries.map((query) => {
        return latestSections[idx].find(
          (section) => section.section_number === query.sectionNumber,
        );
      });
    })
    .filter((section) => typeof section !== 'undefined');

  // Separate by type using correct section codes
  const lectureSections = courseOnlySections.filter(
    (s) =>
      /^[058]/.test(s.section_number) ||
      /^0[WHL]/.test(s.section_number) ||
      /^(HON|HN)/.test(s.section_number),
  );
  const labSections = courseOnlySections.filter((s) =>
    /^[1236]/.test(s.section_number),
  );
  const examSections = courseOnlySections.filter((s) =>
    /^7/.test(s.section_number),
  );

  const fitSections = (
    arr: typeof courseOnlySections,
    otherSections: typeof courseOnlySections,
  ) => arr.filter((s) => !hasConflict(s, otherSections));

  let finalDisplayCount = 0;
  if (lectureSections.length > 0) {
    const fitLectures = fitSections(lectureSections, selectedSections);
    // lecture section
    finalDisplayCount = fitLectures.length;

    if (labSections.length > 0 && examSections.length > 0) {
      // both lab and exam sections also
      const availableLabSections = labSections.filter(
        (sec) => !hasConflict(sec, selectedSections),
      );

      const availableExamSections = examSections.filter(
        (sec) => !hasConflict(sec, selectedSections),
      );

      let numSec = 0;
      for (let i = 0; i < fitLectures.length; i++) {
        const labsForLec = availableLabSections.filter(
          (lab) => !hasConflict(fitLectures[i], [lab]),
        );
        const examsForLec = availableExamSections.filter(
          (exam) => !hasConflict(fitLectures[i], [exam]),
        );

        // check if at least 1 lab and 1 exam fit with the lecture
        if (
          labsForLec.some((lab) =>
            examsForLec.some((exam) => !hasConflict(lab, [exam])),
          )
        ) {
          numSec++;
        }
      }
      finalDisplayCount = numSec;
    } else if (labSections.length > 0) {
      // has a lab section also
      const availableLabSections = labSections.filter(
        (sec) => !hasConflict(sec, selectedSections),
      );

      let numSec = 0;
      for (let i = 0; i < fitLectures.length; i++) {
        const labsForLec = availableLabSections.filter(
          (lab) => !hasConflict(fitLectures[i], [lab]),
        );
        if (labsForLec.length > 0) numSec++;
      }
      finalDisplayCount = numSec;
    } else if (examSections.length > 0) {
      // has an exam section also
      const availableSections = examSections.filter(
        (sec) => !hasConflict(sec, selectedSections),
      );
      let numSec = 0;
      for (let i = 0; i < fitLectures.length; i++) {
        const examsForLec = availableSections.filter(
          (exam) => !hasConflict(fitLectures[i], [exam]),
        );
        if (examsForLec.length > 0) numSec++;
      }
      finalDisplayCount = numSec;
    }
  } else if (labSections.length > 0) {
    const fitLabs = fitSections(labSections, selectedSections);
    // lab section
    finalDisplayCount = fitLabs.length;

    if (examSections.length > 0) {
      // has an exam
      const availableExamSections = examSections.filter((sec) =>
        fitSections([sec], selectedSections),
      );
      let numSec = 0;
      for (let i = 0; i < fitLabs.length; i++) {
        const examForLab = availableExamSections.filter(
          (exam) => !hasConflict(fitLabs[i], [exam]),
        );
        if (examForLab.length > 0) numSec++;
      }
      finalDisplayCount = numSec;
    }
  }

  // only show badge if a) they have something in planner for the current semester and b) the class fits in their schedule
  const displayBadge =
    finalDisplayCount > 0 &&
    planner.some((entry) => entry.semester == effectiveTeachingSemester);

  return (
    <Tooltip
      title={
        searchResult.type === 'professor'
          ? 'Cannot add professor to planner'
          : hasSectionsForTeachingSemester
            ? inPlanner
              ? 'Remove from' +
                (effectiveTeachingSemester !== ''
                  ? ' ' +
                    effectiveTeachingSemester.slice(2) +
                    effectiveTeachingSemester.slice(0, 2)
                  : '') +
                ` Planner (${finalDisplayCount} sections)`
              : 'Add to' +
                (effectiveTeachingSemester !== ''
                  ? ' ' +
                    effectiveTeachingSemester.slice(2) +
                    effectiveTeachingSemester.slice(0, 2)
                  : '') +
                ' Planner' +
                (displayBadge
                  ? `, ${finalDisplayCount} ${finalDisplayCount > 1 ? 'sections fit' : 'section fits'} your schedule!`
                  : '')
            : 'Not being taught' +
              (effectiveTeachingSemester !== ''
                ? ' in ' +
                  effectiveTeachingSemester.slice(2) +
                  effectiveTeachingSemester.slice(0, 2)
                : '')
      }
      placement="top"
    >
      <span>
        <Badge
          badgeContent={<EventAvailableIcon sx={{ fontSize: 12 }} />}
          invisible={!displayBadge}
          overlap="circular"
          color="primary"
        >
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
                addToPlanner(
                  searchResult.searchQuery,
                  effectiveTeachingSemester,
                );
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
              !hasSectionsForTeachingSemester ||
              searchResult.type === 'professor'
            }
          />
        </Badge>
      </span>
    </Tooltip>
  );
}
