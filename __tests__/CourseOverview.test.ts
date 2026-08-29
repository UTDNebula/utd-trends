import { parseDescription } from '@/components/overview/CourseOverview/CourseOverview';
import type { Course } from '@/modules/fetchCourse';

function createCourse(description: string): Course {
  return {
    course_number: '1301',
    credit_hours: 3,
    description,
    title: 'Introduction to Literature',
  } as Course;
}

describe('parseDescription', () => {
  it('preserves a description without a terminal period', () => {
    const description =
      'LIT 1301 - Introduction to Literature (3 semester credit hours) Introduction to literary analysis and interpretation based on readings from a global range of authors (3-0) S';

    expect(parseDescription(createCourse(description))).toMatchObject({
      formattedDescription:
        ' Introduction to literary analysis and interpretation based on readings from a global range of authors (3-0) S',
      offeringFrequency: 'Each semester',
    });
  });

  it('preserves internal periods when there is no terminal period', () => {
    const description =
      'LIT 1301 - Introduction to Literature (3 semester credit hours) Introduction to U.S. literature from a global range of authors (3-0) S';

    expect(parseDescription(createCourse(description))).toMatchObject({
      formattedDescription:
        ' Introduction to U.S. literature from a global range of authors (3-0) S',
      offeringFrequency: 'Each semester',
    });
  });

  it('continues to trim metadata after a terminal period', () => {
    const description =
      'LIT 1301 - Introduction to Literature (3 semester credit hours) Introduction to literary analysis. (3-0) S';

    expect(parseDescription(createCourse(description))).toMatchObject({
      formattedDescription: ' Introduction to literary analysis.',
      offeringFrequency: 'Each semester',
    });
  });
});
