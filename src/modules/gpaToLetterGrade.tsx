export default function gpaToLetterGrade(gpa: number): string {
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.67) return 'A-';
  if (gpa >= 3.33) return 'B+';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.67) return 'B-';
  if (gpa >= 2.33) return 'C+';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.67) return 'C-';
  if (gpa >= 1.33) return 'D+';
  if (gpa >= 1.0) return 'D';
  if (gpa >= 0.67) return 'D-';
  return 'F';
}
