import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

export type Course = {
  _id: string;
  activity_type: string;
  attributes?: string;
  catalog_year: number;
  class_level: string;
  co_or_pre_requisites?: string;
  corequisites?: string;
  course_number: string;
  credit_hours: number;
  description: string;
  enrollment_reqs: string;
  grading: string;
  internal_course_number: string;
  laboratory_contact_hours: number;
  lecture_contact_hours: number;
  offering_frequency: string;
  prerequisites: {
    name: string;
    options: {
      name: string;
      options: {
        condition: string;
        description: string;
        type: string;
      }[];
      required: number;
      type: string;
    }[];
    required: number;
    type: string;
  };
  school: string;
  sections: string[];
  subject_prefix: string;
  title: string;
};

export default async function fetchCourse(
  query: SearchQuery,
): Promise<GenericFetchedData<Course>> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return { message: 'error', data: 'API key is undefined' };
  }

  try {
    const url = new URL('https://api.utdnebula.com/course');
    if (typeof query.prefix === 'string' && typeof query.number === 'string') {
      url.searchParams.append('subject_prefix', query.prefix);
      url.searchParams.append('course_number', query.number);
    } else {
      throw new Error('Incorrect query present');
    }
    const res = await fetch(url.href, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (data.message !== 'success') {
      throw new Error(data.data ?? data.message);
    }

    // find most recent year
    const mostRecent = data.data.reduce((prev: Course, curr: Course) =>
      prev.catalog_year > curr.catalog_year ? prev : curr,
    );

    return {
      message: 'success',
      data: mostRecent,
    };
  } catch (error) {
    return {
      message: 'error',
      data:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
