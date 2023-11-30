/*
This API route is currently just for skedge
*/
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
  data?: unknown;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (
    !(
      'REACT_APP_NEBULA_API_KEY' in process.env &&
      typeof process.env.REACT_APP_NEBULA_API_KEY === 'string'
    )
  ) {
    res.status(400).json({ message: 'API key is undefined' });
  }
  if (
    !(
      'profFirst' in req.query &&
      typeof req.query.profFirst === 'string' &&
      'profLast' in req.query &&
      typeof req.query.profLast === 'string'
    )
  ) {
    res.status(400).json({ message: 'Incorrect query present' });
  }
  const headers = {
    'x-api-key': process.env.REACT_APP_NEBULA_API_KEY as string,
    Accept: 'application/json',
  };
  const url = new URL('https://api.utdnebula.com/professor');
  url.searchParams.append('first_name', req.query.profFirst as string);
  url.searchParams.append('last_name', req.query.profLast as string);
  return new Promise<void>((resolve) => {
    fetch(url.href, {
      method: 'GET',
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'success') {
          throw new Error(data.message);
        }
        res.status(200).json({
          message: 'success',
          data: data.data[0],
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
