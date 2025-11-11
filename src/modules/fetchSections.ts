import { compareSemesters } from '@/modules/semesters';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
} from '@/types/SearchQuery';
import type { Course } from './fetchCourse';
import type { Professor } from './fetchProfessor';

export type SectionsData = {
  _id: string;
  section_number: string;
  course_reference: string;
  section_corequisites: null;
  academic_session: {
    name: string;
    start_date: string;
    end_date: string;
  };
  professors: string[];
  teaching_assistants: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  }[];
  internal_class_number: string;
  instruction_mode: string;
  meetings: {
    start_date: string;
    end_date: string;
    meeting_days: string[];
    start_time: string;
    end_time: string;
    modality: string;
    location: {
      building: string;
      room: string;
      map_uri: string;
    };
  }[];
  core_flags: string[];
  syllabus_uri: string;
  grade_distribution: number[];
  attributes: unknown;
  course_details?: Course[];
  professor_details?: Professor[];
}[];

export type Sections = {
  all: SectionsData;
  latest: SectionsData;
};

async function fetchSingleSections(query: SearchQuery): Promise<SectionsData> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    throw new Error('MISSING API KEY');
  }

  try {
    let url;
    const prefix = query.prefix;
    const number = query.number;
    const profFirst = query.profFirst;
    const profLast = query.profLast;
    if (typeof prefix === 'string' && typeof number === 'string') {
      url = new URL('https://api.utdnebula.com/course/sections/trends');
      url.searchParams.append('subject_prefix', prefix);
      url.searchParams.append('course_number', number);
    } else if (typeof profFirst === 'string' && typeof profLast === 'string') {
      url = new URL('https://api.utdnebula.com/professor/sections/trends');
      url.searchParams.append('first_name', profFirst);
      url.searchParams.append('last_name', profLast);
    }
    if (typeof url === 'undefined') {
      throw new Error('Incorrect query present /section');
    }

    const res = await fetch(url.href, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Section fetch failed');

    const data = await res.json();

    if (data.message !== 'success') {
      throw new Error(data.data ?? data.message);
    }
    console.log(`result for ${JSON.stringify(query)}: ${JSON.stringify(data)}`);

    return data.data;
  } catch (error) {
    console.error(
      `error occured fetching sections for ${JSON.stringify(query)}`,
    );
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
}

export async function fetchLatestSemester(): Promise<string> {
  try {
    const sections = await fetchSingleSections({
      prefix: 'GOVT',
      number: '2306',
    });
    const latestSemester = sections
      //exclude summers
      .filter((sem) => !sem.academic_session.name.includes('U'))
      //find max
      .reduce((a, b) =>
        compareSemesters(b.academic_session.name, a.academic_session.name) < 0
          ? a
          : b,
      ).academic_session.name;
    return latestSemester;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
}

export default async function fetchSections(
  query: SearchQuery,
): Promise<SectionsData> {
  try {
    console.log('start sections fetch');
    const seperatedCombo = [
      convertToCourseOnly(query),
      convertToProfOnly(query),
    ]
      //Remove empty objects (for non combos)
      .filter((obj) => Object.keys(obj).length !== 0);

    console.log(`searchQuery: ${JSON.stringify(query)}`);
    console.log(`individual queries: ${JSON.stringify(seperatedCombo)}`);
    //Call each
    const settledData = await Promise.allSettled(
      seperatedCombo.map((query) => fetchSingleSections(query)),
    );
    const data = settledData
      .filter((p) => p.status === 'fulfilled')
      .map((p) => {
        return p.value;
      });
    console.log(`resolved queries: ${JSON.stringify(data)}`);

    //Find intersection of all course sections and all professor sections
    let intersection: SectionsData = [];
    if (data.length === 1) {
      intersection = data[0];
    } else if (data.length === 2) {
      intersection = data[0].filter((value) =>
        data[1].some((val) => val._id === value._id),
      );
    }
    console.log(`successfully finished sections fetch`);
    return intersection;
  } catch (error) {
    console.error(`sections fetch failed`);
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
}
