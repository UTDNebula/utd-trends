import type { GradesData } from '@/pages/api/grades';

export type GradesType = {
  gpa: number;
  total: number;
  grade_distribution: number[];
  grades: GradesData;
};
