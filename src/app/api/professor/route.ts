/*THIS ROUTE IS USED BY SKEDGE*/
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API key is undefined' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const profFirst = searchParams.get('profFirst');
  const profLast = searchParams.get('profLast');

  if (typeof profFirst !== 'string' || typeof profLast !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };

  const url = new URL('https://api.utdnebula.com/professor');
  url.searchParams.append('first_name', profFirst);
  url.searchParams.append('last_name', profLast);

  try {
    const response = await fetch(url.href, { headers });
    const result = await response.json();

    if (result.message !== 'success') {
      throw new Error(result.data ?? result.message);
    }

    return NextResponse.json(
      {
        message: 'success',
        data: result.data[0],
      },
      { status: 200 },
    );
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
