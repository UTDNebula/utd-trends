// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type ErrorState = {
  error: string;
};
type SuccessState = {
  data: {
    name: string;
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
      fetch('https://api.utdnebula.com/professor/' + req.query.id, {
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
              data.data.first_name +
              ' ' +
              data.data.last_name,
            /*data: data.data.grade_distribution,*/
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
