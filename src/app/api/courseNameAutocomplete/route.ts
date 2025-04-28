import { NextResponse } from 'next/server';

import untypedCourseNameTable from '@/data/course_name_table.json';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

const courseNameTable = untypedCourseNameTable as {
  [key: string]: SearchQuery[];
};

// Edit distance between 2 strings
function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }
  return dp[a.length][b.length];
}

const LIMIT = 10;

interface Result {
  title: string;
  result: SearchQuery;
}

type ResultWDistance = Result & {
  distance: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let input = searchParams.get('input');
  if (typeof input !== 'string') {
    return NextResponse.json(
      { message: false, data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }
  input = input.toLowerCase();
  const inputArr = input.split(' ');

  let results: ResultWDistance[] = [];

  // check each course name
  for (const title in courseNameTable) {
    // for each word in query, find the word in the course name that is most similar
    const distance = inputArr
      .map((word) =>
        Math.min(
          ...title
            .toLowerCase()
            .split(' ')
            .map((titleWord) => levenshtein(word, titleWord)),
        ),
      )
      .reduce((partialSum, a) => partialSum + a, 0);
    const newResults: ResultWDistance[] = courseNameTable[title].map(
      (result) => ({
        distance: distance,
        title: title,
        result: result,
      }),
    );

    if (!results.length) {
      results.push(...newResults);
      continue;
    }
    const place = results.findIndex((x) => x.distance > distance);
    if (place !== -1) {
      // replace if already hit limit
      results.splice(
        place,
        results.length < LIMIT ? 0 : newResults.length,
        ...newResults,
      );
      results = results.slice(0, 10);
    }
  }

  const resultsWithoutDistance: Result[] = results.map((result) => ({
    title: result.title,
    result: result.result,
  }));

  return NextResponse.json(
    {
      message: 'success',
      data: resultsWithoutDistance,
    } satisfies GenericFetchedData<Result[]>,
    { status: 200 },
  );
}
