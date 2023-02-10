// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: {
    name: string;
    data: number[];
  }[];
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
    if ('sections' in req.query && typeof req.query.sections === 'string') {
      Promise.all(
        req.query.sections.split(',').map((section) =>
          fetch('https://api.utdnebula.com/section/' + section, {
            method: 'GET',
            headers: headers,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message !== 'success') {
                throw new Error(data.data);
              }
              console.log(data.data);
              return {
                name:
                  data.data.section_number +
                  ' ' +
                  data.data.academic_session.name,
                data: data.data.grade_distribution,
              };
            }),
        ),
      )
        .then((responses) => {
          res.status(200).json({ data: responses });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
    } else {
      res.status(400).json({ error: 'No sections query present' });
    }
  }
}
