import { fetchSearchResult } from '@/modules/fetchSearchResult';
import { fetchLatestSemester } from '@/modules/fetchSections';
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
  const prefix = searchParams.get('prefix') ?? undefined;
  const number = searchParams.get('number') ?? undefined;
  const profFirst = searchParams.get('profFirst') ?? undefined;
  const profLast = searchParams.get('profLast') ?? undefined;

  if (
    typeof prefix !== 'string' &&
    typeof number !== 'string' &&
    typeof profFirst !== 'string' &&
    typeof profLast !== 'string'
  ) {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  try {
    const result = await fetchSearchResult({
      prefix: prefix,
      number: number,
      profFirst: profFirst,
      profLast: profLast,
    });
    const latest = await fetchLatestSemester();
    result.sections = result.sections.filter(
      (s) => s.academic_session.name === latest,
    );

    return NextResponse.json(
      {
        message: 'success',
        data: result,
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
