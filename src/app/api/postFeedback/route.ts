import { auth, JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const CREDENTIALS = process.env.REACT_APP_GOOGLE_CREDENTIALS;
  if (typeof CREDENTIALS !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API key is undefined' },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'error', data: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { rating, extra = '', env = 'unknown' } = body;

  if (typeof rating !== 'number') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect body parameters present' },
      { status: 400 },
    );
  }

  try {
    const client = auth.fromJSON(JSON.parse(CREDENTIALS));
    if (client instanceof JWT) {
      client.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    }

    const response = await client.request({
      url: 'https://sheets.googleapis.com/v4/spreadsheets/1ZIMAw97gey1BoibVO6BT6Fvw7A0T253xmalSCLqV2n8/values/Data!A1:E1:append?valueInputOption=RAW',
      method: 'POST',
      data: {
        range: 'Data!A1:E1',
        majorDimension: 'ROWS',
        values: [[Date.now(), env, rating, extra]],
      },
    });

    if (response.statusText !== 'OK') {
      throw new Error(response.statusText);
    }

    return NextResponse.json({ message: 'success' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'error',
        data:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 400 },
    );
  }
}
