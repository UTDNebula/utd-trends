import { type Sections } from '@/modules/fetchSections';
import type {
  SearchQuery,
  SearchQueryMultiSection,
  SearchResult,
} from '@/types/SearchQuery';
import type { UseQueryResult } from '@tanstack/react-query';
import { calculateGrades } from './fetchGrades';

type Section = Sections['all'][number];

interface CourseOption {
  query: SearchQuery;
  section: Section;
  score: number;
}

export function parseTime(time: string): number {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr.slice(0, 2));
  const isPM = time.toLowerCase().includes('pm');
  let hourNum = hour;

  if (isPM && hour !== 12) {
    hourNum += 12;
  } else if (!isPM && hour === 12) {
    hourNum = 0; // Midnight case
  }
  return hourNum + minute / 60;
}

export function checkConflict(sec1: Section, sec2: Section): boolean {
  if (!sec1 || !sec2) return false;

  for (const sec1Meeting of sec1.meetings) {
    if (!sec1Meeting || !sec1Meeting.meeting_days) continue;

    for (const sec2Meeting of sec2.meetings) {
      if (!sec2Meeting || !sec2Meeting.meeting_days) continue;

      // Check if days overlap
      const overlappingDays = sec1Meeting.meeting_days.some((day) =>
        sec2Meeting.meeting_days.includes(day),
      );

      if (overlappingDays) {
        // Convert times to comparable values
        const newStart = parseTime(sec1Meeting.start_time);
        const newEnd = parseTime(sec1Meeting.end_time);
        const existingStart = parseTime(sec2Meeting.start_time);
        const existingEnd = parseTime(sec2Meeting.end_time);

        // Check if times overlap
        if (
          (newStart < existingEnd && newStart >= existingStart) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd) ||
          (newStart >= existingStart && newEnd <= existingEnd)
        ) {
          if (
            sec2.course_details &&
            sec2.course_details[0] &&
            sec1.course_details &&
            sec1.course_details[0] &&
            sec2.course_details[0].subject_prefix ==
              sec1.course_details[0].subject_prefix &&
            sec2.course_details[0].course_number ==
              sec1.course_details[0].course_number
          )
            return false; // if times overlap, but same course, we can switch it out without conflict
          return true; // Conflict detected
        }
      }
    }
  }
  return false;
}

// heuristic to core a section based on its desirability
function scoreSection(section: Section, searchResult?: SearchResult): number {
  let score = 0;

  // professor-based prioritization
  if (section.professor_details && section.professor_details.length > 0) {
    score += 10;

    // rmp data
    if (
      searchResult &&
      (searchResult?.type == 'combo' || searchResult?.type == 'professor') &&
      searchResult.RMP &&
      searchResult.RMP.numRatings > 5
    ) {
      score += searchResult.RMP.avgRating * 10;
      score += 10 / searchResult.RMP.avgDifficulty;
    }
  } else {
    score -= 20; // Penalize "Staff" or unassigned sections
  }

  // grades-based prioritization
  if (
    searchResult &&
    (searchResult?.type == 'combo' || searchResult?.type == 'course')
  ) {
    const grades = calculateGrades(searchResult.grades);
    // grades data
    if (grades.total > 0) {
      score += (grades.gpa - 3.0) * 10; // median
    }
  }

  // prioritize middle of the day
  if (section.meetings[0]?.start_time) {
    const startTime = parseTime(section.meetings[0].start_time);
    if (startTime < 9) score -= 5; // Penalize classes before 9 AM
    if (startTime > 17) score -= 5; // Penalize evening classes
  }

  return score;
}

export function generateOptimalSchedule(
  planner: SearchQueryMultiSection[],
  allResults: UseQueryResult<SearchResult, Error>[],
  latestSemester: string,
) {
  const lockedCourseKeys = new Set<string>();
  const lockedSections: CourseOption[] = [];
  const courseOptions = new Map<string, CourseOption[]>();

  const latestSections = allResults.map((r) =>
    r.isSuccess
      ? r.data.sections.filter(
          (s) => s.academic_session.name === latestSemester,
        )
      : [],
  );

  // already-selected sections cannot be changed
  planner.forEach((query, idx) => {
    const courseKey = `${query.prefix} ${query.number}`;
    const sections = latestSections[idx] || [];
    const selectedIds = query.sectionNumbers || [];
    const searchResult = allResults[idx].isSuccess
      ? allResults[idx].data
      : undefined;

    sections.forEach((section) => {
      if (selectedIds.includes(section.section_number)) {
        lockedSections.push({
          query,
          section,
          score: scoreSection(section, searchResult),
        });
        lockedCourseKeys.add(courseKey);
      }
    });
  });

  // score valid unassigned options
  planner.forEach((query, idx) => {
    const courseKey = `${query.prefix} ${query.number}`;
    if (lockedCourseKeys.has(courseKey)) return;

    const sections = latestSections[idx] || [];
    const searchResult = allResults[idx].isSuccess
      ? allResults[idx].data
      : undefined;

    if (!courseOptions.has(courseKey)) courseOptions.set(courseKey, []);

    sections.forEach((section) => {
      const existingOptions = courseOptions.get(courseKey)!;

      // prevent duplicates if planner has overall and combo result
      if (
        !existingOptions.some(
          (opt) => opt.section.section_number === section.section_number,
        )
      ) {
        existingOptions.push({
          query,
          section,
          score: scoreSection(section, searchResult),
        });
      }
    });

    // greedy: sort sections for this course
    courseOptions.get(courseKey)!.sort((a, b) => b.score - a.score);
  });

  const coursesToSchedule = Array.from(courseOptions.values());

  // the best global schedule found so far
  let bestSchedule: CourseOption[] = [...lockedSections];
  let maxScheduled = lockedSections.length;
  // starting score based on locked sections
  let maxScore = lockedSections.reduce((sum, item) => sum + item.score, 0);

  // early stopping limit to prevent browser hanging
  let iterations = 0;
  const MAX_ITERATIONS = 5000;

  // backtrack using heurstic
  function backtrack(
    courseIdx: number,
    currentSchedule: CourseOption[],
    currentScore: number,
  ) {
    iterations++;

    // best case / time to stop
    if (courseIdx === coursesToSchedule.length || iterations > MAX_ITERATIONS) {
      if (
        currentSchedule.length > maxScheduled ||
        (currentSchedule.length === maxScheduled && currentScore > maxScore)
      ) {
        maxScheduled = currentSchedule.length;
        maxScore = currentScore;
        bestSchedule = [...currentSchedule];
      }
      return;
    }

    const options = coursesToSchedule[courseIdx];

    // Try assigning each available section (already sorted best to worst)
    for (const option of options) {
      const hasConflict = currentSchedule.some((existing) =>
        checkConflict(existing.section, option.section),
      );

      if (!hasConflict) {
        currentSchedule.push(option);
        backtrack(courseIdx + 1, currentSchedule, currentScore + option.score);
        currentSchedule.pop();
      }
    }

    // Always try the path where we skip this course entirely
    backtrack(courseIdx + 1, currentSchedule, currentScore);
  }

  // Start backtrack
  const initialScore = lockedSections.reduce(
    (sum, item) => sum + item.score,
    0,
  );
  backtrack(0, [...lockedSections], initialScore);

  const newAssignments = bestSchedule.filter(
    (item) =>
      !lockedSections.some(
        (locked) =>
          locked.section.section_number === item.section.section_number &&
          locked.query.prefix === item.query.prefix &&
          locked.query.number === item.query.number,
      ),
  );

  return {
    bestSchedule,
    newAssignments,
    totalAssigned: bestSchedule.length,
    stoppedEarly: iterations > MAX_ITERATIONS,
  };
}
