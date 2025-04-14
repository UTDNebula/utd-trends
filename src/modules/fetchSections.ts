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

type Sections = {
  all: SectionsData;
  latest: SectionsData;
};

async function fetchSingleSections(
  query: SearchQuery,
): Promise<GenericFetchedData<SectionsData>> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return { message: 'API key is undefined' };
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
      return { message: 'Incorrect query present' };
    }

    function recursiveFetch(url: URL, offset: number): Promise<Sections> {
      const offsetUrl = new URL(url);
      offsetUrl.searchParams.append('latter_offset', offset.toString());

      return fetch(offsetUrl.href, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          Accept: 'application/json',
        },
        cache: 'force-cache',
        next: { revalidate: 3600 },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== 'success') {
            throw new Error(data.message);
          }
          if (data.data === null) {
            return [];
          }
          return recursiveFetch(url, offset + 20).then((nextData) =>
            data.data.concat(nextData),
          );
        });
    }

    const res = await recursiveFetch(url, 0);

    const data = await res.json();

    return {
      message: 'success',
      data: data,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export default async function fetchSections(
  query: SearchQuery,
): Promise<GenericFetchedData<Sections>> {
  const seperatedCombo = [convertToCourseOnly(query), convertToProfOnly(query)]
    //Remove empty objects (for non combos)
    .filter((obj) => Object.keys(obj).length !== 0);
  //Call each
  const data = await Promise.all(
    seperatedCombo.map((query) => fetchSingleSections(query, controller)),
  );
  if (data[0].message !== 'success') {
    return { message: data[0].message };
  }
  if (data[1] && data[1].message !== 'success') {
    return { message: data[1].message };
  }

  //Find intersection of all course sections and all professor sections
  let intersection: Sections = [];
  if (data.length === 1) {
    intersection = data[0];
  } else if (data.length === 2) {
    intersection = data[0].filter(
      (value) => data[1].findIndex((val) => val._id === value._id) !== -1,
    );
  }
  //Filter to only latestSemester
  const latest = intersection.filter(
    (section) => section.academic_session.name === '25F', /// CHANGE BACK: latestSemester.current,
  );
  return {
    message: 'success',
    data: {
      all: intersection,
      latest: latest,
    },
  };
}
