import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const API_URL = process.env.NEBULA_API_KEY;
  if (typeof API_URL !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API URL is undefined' },
      { status: 500 },
    );
  }
  const API_KEY = process.env.NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API key is undefined' },
      { status: 500 },
    );
  }
  const API_STORAGE_BUCKET = process.env.NEBULA_API_KEY;
  if (typeof API_STORAGE_BUCKET !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API storage bucket is undefined' },
      { status: 500 },
    );
  }
  const API_STORAGE_KEY = process.env.NEBULA_API_KEY;
  if (typeof API_STORAGE_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API storage key is undefined' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix');
  const number = searchParams.get('number');
  const profFirst = searchParams.get('profFirst');
  const profLast = searchParams.get('profLast');

  if (
    typeof prefix !== 'string' ||
    typeof number !== 'string' ||
    typeof profFirst !== 'string' ||
    typeof profLast !== 'string'
  ) {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  // Check cache
  const filename = prefix + number + profFirst + profLast + '.txt';
  const headers = {
    'x-api-key': API_KEY,
    'x-storage-key': API_KEY,
  };
  const cache = await fetch(API_URL + 'storage/' + API_STORAGE_BUCKET + "/" + filename, { headers })

  // Fetch RMP


  // AI


  // Cache


  // Return
}
