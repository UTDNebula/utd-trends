import { type Sections } from '@/modules/fetchSections';
import {
  convertToProfOnly,
  searchQueryLabel,
  type SearchQuery,
  type SearchQueryMultiSection,
  type SearchResult,
} from '@/types/SearchQuery';
import type { UseQueryResult } from '@tanstack/react-query';
import { calculateGrades } from './fetchGrades';

type Section = Sections['all'][number];

interface ParsedMeeting {
  days: string[];
  start: number;
  end: number;
}
interface CourseOption {
  query: SearchQuery;
  section: Section;
  score: number;
  meetings: ParsedMeeting[];
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

export function checkConflict(
  sec1Meetings: ParsedMeeting[],
  sec2Meetings: ParsedMeeting[],
): boolean {
  for (const sec1Meeting of sec1Meetings) {
    if (!sec1Meeting || !sec1Meeting.days) continue;

    for (const sec2Meeting of sec2Meetings) {
      if (!sec2Meeting || !sec2Meeting.days) continue;

      // Check if days overlap
      const overlappingDays = sec1Meeting.days.some((day) =>
        sec2Meeting.days.includes(day),
      );

      if (
        overlappingDays &&
        sec1Meeting.start < sec2Meeting.end &&
        sec1Meeting.end > sec2Meeting.start
      ) {
        return true; // Conflict detected
      }
    }
  }
  return false;
}

// heuristic to score a section based on its desirability
function scoreSection(
  section: Section,
  meetings: ParsedMeeting[],
  searchResult?: SearchResult,
): number {
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
      score += (searchResult.RMP.avgRating - 3.0) * 10; // [-20, 20]
      if (searchResult.RMP.avgDifficulty > 0)
        score += (3.0 - searchResult.RMP.avgDifficulty) * 5; // [-10, 10]
    }
  } else {
    score -= 10; // Penalize "Staff" or unassigned sections
  }

  // grades-based prioritization
  if (searchResult) {
    const grades = calculateGrades(searchResult.grades);
    // grades data
    if (grades.total > 0) {
      score += (grades.gpa - 3.0) * 15; // median
    } else {
      score -= 5;
    }
  }

  // prioritize middle of the day
  if (meetings.length > 0) {
    if (meetings[0].start < 9) score -= 5; // Penalize classes before 9 AM
    if (meetings[0].start > 17 || meetings[0].end > 18) score -= 5; // Penalize evening classes
  }

  if (!searchResult) {
    score -= 5;
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
        const parsedMeetings = section.meetings
          .filter((m) => m && m.meeting_days && m.start_time && m.end_time)
          .map((m) => ({
            days: m.meeting_days,
            start: parseTime(m.start_time),
            end: parseTime(m.end_time),
          }));
        lockedSections.push({
          query,
          section,
          score: scoreSection(section, parsedMeetings, searchResult),
          meetings: parsedMeetings,
        });
        lockedCourseKeys.add(courseKey);
      }
    });
  });

  // check if professors need to be constrained for courses based on who is added to MyPlanner
  const professorConstraints = new Map<string, Set<string>>();
  const hasOverallQuery = new Map<string, boolean>();

  planner.forEach((query) => {
    const courseKey = `${query.prefix} ${query.number}`;

    if (query.profFirst && query.profLast) {
      if (!professorConstraints.has(courseKey))
        professorConstraints.set(courseKey, new Set());

      const targetProf = searchQueryLabel(convertToProfOnly(query));

      if (targetProf) {
        professorConstraints.get(courseKey)!.add(targetProf);
      }
    } else {
      hasOverallQuery.set(courseKey, true);
    }
  });

  // score valid unassigned options
  planner.forEach((query, idx) => {
    const courseKey = `${query.prefix} ${query.number}`;
    if (lockedCourseKeys.has(courseKey)) return;

    const result = allResults[idx];
    if (!result.isSuccess) return;

    const searchResult = result.data;
    const sections = searchResult.sections.filter(
      (s) => s.academic_session.name === latestSemester,
    );

    const constraints = professorConstraints.get(courseKey);
    const isOverallOnly = !constraints || constraints.size === 0;

    if (!courseOptions.has(courseKey)) courseOptions.set(courseKey, []);
    const existingOptions = courseOptions.get(courseKey)!;

    sections.forEach((section) => {
      const isPreferredProf = section.professor_details?.some((prof) =>
        constraints?.has(prof.first_name + ' ' + prof.last_name),
      );

      // if Only combo is added, don't allow any other sections
      if (!isOverallOnly && !hasOverallQuery.get(courseKey) && !isPreferredProf)
        return;

      // prevent duplicates if planner has overall and combo result
      if (
        !existingOptions.some(
          (opt) => opt.section.section_number === section.section_number,
        )
      ) {
        const parsedMeetings = section.meetings
          .filter((m) => m && m.meeting_days && m.start_time && m.end_time)
          .map((m) => ({
            days: m.meeting_days,
            start: parseTime(m.start_time),
            end: parseTime(m.end_time),
          }));

        let score = scoreSection(section, parsedMeetings, searchResult);

        // if both overall & combo exist, penalize non-combo profs
        if (!isOverallOnly && hasOverallQuery.get(courseKey)) {
          if (!isPreferredProf) {
            score -= 20; // penalty but still available if others conflict
          } else {
            score += 20; // preferred
          }
        }

        existingOptions.push({
          query,
          section,
          score,
          meetings: parsedMeetings,
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
        checkConflict(existing.meetings, option.meetings),
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
