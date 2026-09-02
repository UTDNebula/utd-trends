import { calculateGrades, type GradesData } from '@/modules/fetchGrades';

function gradesWithDistribution(distribution: number[]): GradesData {
  return [
    {
      _id: '26F',
      data: [{ type: 'LEC', grade_distribution: distribution }],
    },
  ];
}

describe('calculateGrades median', () => {
  it('preserves A+ when it accounts for half of the letter grades', () => {
    const result = calculateGrades(gradesWithDistribution([5, 5]));

    expect(result.gpa).toBe(4);
    expect(result.median_letter_grade).toBe('A+');
  });

  it('reports A when fewer than half of the letter grades are A+', () => {
    const result = calculateGrades(gradesWithDistribution([4, 6]));

    expect(result.gpa).toBe(4);
    expect(result.median_letter_grade).toBe('A');
  });

  it('uses the middle grade for an odd number of letter grades', () => {
    const result = calculateGrades(gradesWithDistribution([2, 3]));

    expect(result.median_letter_grade).toBe('A');
  });

  it('handles a single letter grade', () => {
    const result = calculateGrades(gradesWithDistribution([1]));

    expect(result.gpa).toBe(4);
    expect(result.median_letter_grade).toBe('A+');
  });
});
