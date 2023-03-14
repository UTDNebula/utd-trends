// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: {
    name?: string;
    id?: string;
    /*grade_distribution: number[];*/
  };
};
type Data = ErrorState | SuccessState;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (typeof process.env.REACT_APP_NEBULA_API_KEY === 'undefined') {
    res.status(400).json({ error: 'API key is undefined' });
  } else {
    const headers: HeadersInit = {
      'x-api-key': process.env.REACT_APP_NEBULA_API_KEY,
      Accept: 'application/json',
    };
    if ('id' in req.query && typeof req.query.id === 'string') {
      fetch('https://api.utdnebula.com/course/' + req.query.id, {
        method: 'GET',
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== 'success') {
            throw new Error(data.data);
          }
          res.status(200).json({
            data: {
              name: data.data.subject_prefix + ' ' + data.data.course_number,
              /*grade_distribution: data.data.grade_distribution,*/
            },
          });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
    } else if (
      'prefix' in req.query &&
      typeof req.query.prefix === 'string' &&
      'number' in req.query &&
      typeof req.query.number === 'string'
    ) {
      const Url = new URL('https://api.utdnebula.com/course/');
      Url.searchParams.append('course_number', req.query.number);
      Url.searchParams.append('subject_prefix', req.query.prefix);
      fetch(Url.href, {
        method: 'GET',
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== 'success') {
            throw new Error(data.data);
          }
          res.status(200).json({
            data: {
              id: data.data[0]._id,
              /*grade_distribution: data.data[0].grade_distribution,*/
            },
          });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
    } else {
      res.status(400).json({ error: 'No id query present' });
    }
  }
}
