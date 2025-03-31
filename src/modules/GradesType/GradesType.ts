import type { GradesData } from '@/pages/api/grades';

type GradesSummary = {
  gpa: number;
  total: number;
  grade_distribution: number[];
};

export type GradesType = {
  filtered: GradesSummary;
  unfiltered: GradesSummary;
  grades: GradesData;
};
