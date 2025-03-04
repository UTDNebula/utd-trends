// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

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
  };
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

type Data = {
  message: string;
  data?: SectionsData;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    res.status(500).json({ message: 'API key is undefined' });
    return;
  }
  let url;
  const prefix = req.query.prefix;
  const number = req.query.number;
  const profFirst = req.query.profFirst;
  const profLast = req.query.profLast;
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
    res.status(400).json({ message: 'Incorrect query present' });
    return;
  }
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };

  function recursiveFetch(url: URL, offset: number): Promise<SectionsData> {
    const offsetUrl = new URL(url);
    offsetUrl.searchParams.append('latter_offset', offset.toString());

    return fetch(offsetUrl.href, {
      method: 'GET',
      headers: headers,
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

  return new Promise<void>((resolve) => {
    recursiveFetch(url, 0)
      .then((data) => {
        res.status(200).json({
          message: 'success',
          data: data,
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
