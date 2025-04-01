// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

export type GradesData = {
  _id: string;
  grade_distribution: number[];
}[];

type Data = {
  message: string;
  data?: GradesData;
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
  const profFirst = req.query.profFirst;
  const profLast = req.query.profLast;
  if (
    typeof prefix !== 'string' &&
    typeof number !== 'string' &&
    typeof profFirst !== 'string' &&
    typeof profLast !== 'string'
  ) {
    res.status(400).json({ message: 'Incorrect query present' });
    return;
  }
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };
  const url = new URL('https://api.utdnebula.com/grades/semester');
  if (typeof prefix === 'string') {
    url.searchParams.append('prefix', prefix);
  }
  if (typeof number === 'string') {
    url.searchParams.append('number', number);
  }
  if (typeof profFirst === 'string' && typeof profLast === 'string') {
    url.searchParams.append('first_name', profFirst);
    url.searchParams.append('last_name', profLast);
  }
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
