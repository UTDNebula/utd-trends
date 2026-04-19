import { calculateGrades, type GradesData } from '@/modules/fetchGrades';
import { compareSemesters } from '@/modules/semesters';

export type GpaTrendDirection = 'up' | 'down' | null;

export type GpaTrendResult = {
  direction: GpaTrendDirection;
  recentAvg: number | null;
  priorAvg: number | null;
  usableRecentCount: number;
  usablePriorCount: number;
  recentSemesters: string[];
};

function isLongSemester(semesterId: string): boolean {
  return semesterId[2] === 'F' || semesterId[2] === 'S';
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateGpaTrend({
  grades,
  chosenSectionTypes,
  maxRecentLongSemesters = 4,
  minUsableRecentLongSemesters = 2,
  epsilon = 1e-6,
}: {
  grades: GradesData;
  chosenSectionTypes: string[];
  maxRecentLongSemesters?: number;
  minUsableRecentLongSemesters?: number;
  epsilon?: number;
}): GpaTrendResult {
  const allLongSemesters = Array.from(new Set(grades.map((g) => g._id)))
    .filter(isLongSemester)
    .sort((a, b) => compareSemesters(b, a));

  const recentSemesters = allLongSemesters.slice(0, maxRecentLongSemesters);
  const cutoff =
    recentSemesters.length > 0
      ? recentSemesters[recentSemesters.length - 1]
      : null;

  const recentMeans = recentSemesters
    .map((sem) => calculateGrades(grades, [sem], chosenSectionTypes).mean_gpa)
    .filter((mean) => mean !== -1);

  if (recentMeans.length < minUsableRecentLongSemesters || cutoff === null) {
    return {
      direction: null,
      recentAvg: null,
      priorAvg: null,
      usableRecentCount: recentMeans.length,
      usablePriorCount: 0,
      recentSemesters,
    };
  }

  const priorSemesters = allLongSemesters.filter(
    (sem) => compareSemesters(sem, cutoff) < 0,
  );

  const priorMeans = priorSemesters
    .map((sem) => calculateGrades(grades, [sem], chosenSectionTypes).mean_gpa)
    .filter((mean) => mean !== -1);

  const recentAvg = average(recentMeans);
  const priorAvg = average(priorMeans);

  if (recentAvg === null || priorAvg === null) {
    return {
      direction: null,
      recentAvg,
      priorAvg,
      usableRecentCount: recentMeans.length,
      usablePriorCount: priorMeans.length,
      recentSemesters,
    };
  }

  const diff = recentAvg - priorAvg;
  const direction: GpaTrendDirection =
    Math.abs(diff) <= epsilon ? null : diff > 0 ? 'up' : 'down';

  return {
    direction,
    recentAvg,
    priorAvg,
    usableRecentCount: recentMeans.length,
    usablePriorCount: priorMeans.length,
    recentSemesters,
  };
}
