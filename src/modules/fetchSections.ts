import { compareSemesters } from '@/modules/semesters';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
} from '@/types/SearchQuery';

type SectionsData = {
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
}[];

export type Sections = {
  all: SectionsData;
  latest: SectionsData;
};

async function recursiveFetchSingleSections(
  url: URL,
  offset: number,
): Promise<SectionsData> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return [];
  }

  const offsetUrl = new URL(url);
  offsetUrl.searchParams.append('latter_offset', offset.toString());

  const res = await fetch(offsetUrl.href, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
      Accept: 'application/json',
    },
    next: { revalidate: 3600 },
  });

  const data = await res.json();

  if (data.message !== 'success') {
    throw new Error(data.message);
  }
  if (data.data === null) {
    return [];
  }
  const nextData = await recursiveFetchSingleSections(url, offset + 20);
  return data.data.concat(nextData);
}

async function fetchSingleSections(
  query: SearchQuery,
): Promise<GenericFetchedData<SectionsData>> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return { message: 'error', error: 'API key is undefined' };
  }

  try {
    let url;
    const prefix = query.prefix;
    const number = query.number;
    const profFirst = query.profFirst;
    const profLast = query.profLast;
    if (typeof prefix === 'string' && typeof number === 'string') {
      url = new URL('https://api.utdnebula.com/course/sections');
      url.searchParams.append('subject_prefix', prefix);
      url.searchParams.append('course_number', number);
    } else if (typeof profFirst === 'string' && typeof profLast === 'string') {
      url = new URL('https://api.utdnebula.com/professor/sections');
      url.searchParams.append('first_name', profFirst);
      url.searchParams.append('last_name', profLast);
    }
    if (typeof url === 'undefined') {
      return { message: 'error', error: 'Incorrect query present' };
    }

    const data = await recursiveFetchSingleSections(url, 0);

    return {
      message: 'success',
      data: data,
    };
  } catch (error) {
    return {
      message: 'error',
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

async function fetchLatestSemester(): Promise<GenericFetchedData<string>> {
  try {
    const sections = await fetchSingleSections({
      prefix: 'GOVT',
      number: '2306',
    });
    if (sections.message !== 'success') {
      return sections;
    }
    const latestSemester = sections.data
      //exclude summers
      .filter((sem) => !sem.academic_session.name.includes('U'))
      //find max
      .reduce((a, b) =>
        compareSemesters(b.academic_session.name, a.academic_session.name) < 0
          ? a
          : b,
      ).academic_session.name;
    return {
      message: 'success',
      data: latestSemester,
    };
  } catch (error) {
    return {
      message: 'error',
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export default async function fetchSections(
  query: SearchQuery,
): Promise<GenericFetchedData<Sections>> {
  try {
    const seperatedCombo = [
      convertToCourseOnly(query),
      convertToProfOnly(query),
    ]
      //Remove empty objects (for non combos)
      .filter((obj) => Object.keys(obj).length !== 0);

    //Call each
    const [latestSemester, data] = await Promise.all([
      fetchLatestSemester(),
      Promise.all(seperatedCombo.map((query) => fetchSingleSections(query))),
    ]);

    if (latestSemester.message !== 'success') {
      return { message: 'error', error: latestSemester.message };
    }
    if (data[0].message !== 'success') {
      return { message: 'error', error: data[0].message };
    }
    if (data.length === 2 && data[1].message !== 'success') {
      return { message: 'error', error: data[1].message };
    }

    //Find intersection of all course sections and all professor sections
    let intersection: SectionsData = [];
    if (data.length === 1) {
      intersection = data[0].data;
    } else if (data.length === 2) {
      intersection = data[0].data.filter(
        (value) =>
          data[1].message !== 'success' ||
          data[1].data.some((val) => val._id === value._id),
      );
    }
    //Filter to only latestSemester
    const latest = intersection.filter(
      (section) => section.academic_session.name === latestSemester.data,
    );
    return {
      message: 'success',
      data: {
        all: intersection,
        latest: latest,
      },
    };
  } catch (error) {
    return {
      message: 'error',
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
