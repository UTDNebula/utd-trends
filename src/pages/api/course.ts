// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export type CourseData = {
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

type Data = {
  message: string;
  data?: CourseData;
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
  const prefix = req.query.prefix;
  const number = req.query.number;
  if (typeof prefix !== 'string' && typeof number !== 'string') {
    res.status(400).json({ message: 'Incorrect query present' });
    return;
  }
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };
  const url = new URL('https://api-gateway-djz4awx7.uc.gateway.dev/course');
  if (typeof prefix === 'string') {
    url.searchParams.append('subject_prefix', prefix);
  }
  if (typeof number === 'string') {
    url.searchParams.append('course_number', number);
  }

  return new Promise<void>((resolve) => {
    fetch(url.href, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log('data', data, data.message);
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        res.status(200).json({
          message: 'success',
          data: data.data,
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
