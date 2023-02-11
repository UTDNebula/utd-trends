// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: {
    name: string;
    grade_distribution: number[];
	  professors: string[];
	  course_reference: string;
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
      fetch('https://api.utdnebula.com/section/' + req.query.id, {
        method: 'GET',
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message !== 'success') {
            throw new Error(data.data);
          }
          res.status(200).json({data: {
            name:
              data.data.section_number +
              ' ' +
              data.data.academic_session.name,
              grade_distribution: data.data.grade_distribution,
              professors: data.data.professors,
              course_reference: data.data.course_reference,
          }});
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
    } else {
      res.status(400).json({ error: 'No id query present' });
    }
  }
}
