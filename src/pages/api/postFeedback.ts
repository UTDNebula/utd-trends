// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { auth, JWT } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const CREDENTIALS = process.env.REACT_APP_GOOGLE_CREDENTIALS;
  if (typeof CREDENTIALS !== 'string') {
    res.status(500).json({ message: 'API key is undefined' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
  const body = JSON.parse(req.body);
  const rating = body.rating;
  if (typeof rating !== 'number') {
    res.status(400).json({ message: 'Incorrect body paramaters present' });
    return;
  }
  let extra = '';
  if ('extra' in body && typeof body.extra === 'string') {
    extra = body.extra;
  }
  let env = 'unknown';
  if ('env' in body && typeof body.env === 'string') {
    env = body.env;
  }
  return new Promise<void>((resolve) => {
    const client = auth.fromJSON(JSON.parse(CREDENTIALS));
    if (client instanceof JWT) {
      client.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    }
    client
      .request({
        url: 'https://sheets.googleapis.com/v4/spreadsheets/1ZIMAw97gey1BoibVO6BT6Fvw7A0T253xmalSCLqV2n8/values/Data!A1:E1:append?valueInputOption=RAW',
        method: 'POST',
        data: {
          range: 'Data!A1:E1',
          majorDimension: 'ROWS',
          values: [[Date.now(), env, rating, extra]],
        },
      })
      .then((data) => {
        if (data.statusText !== 'OK') {
          throw new Error(data.statusText);
        }
        res.status(200).json({
          message: 'success',
        });
        resolve();
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
        resolve();
      });
  });
}
