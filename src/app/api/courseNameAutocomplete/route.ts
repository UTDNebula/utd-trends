import { NextResponse } from 'next/server';

import untypedCourseNameTable from '@/data/course_name_table.json';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

const courseNameTable = untypedCourseNameTable as {
  [key: string]: SearchQuery[];
};

// Edit distance between 2 strings
function editDistance(a: string, b: string) {
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

function minEditDistance(words: string[], query: string) {
  return Math.min(...words.map((word) => editDistance(word, query)));
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
    const titleWords = title.toLowerCase().split(' ');

    // for each word in query, find the word in the course name that is most similar
    const distances = inputArr.map((word) => minEditDistance(titleWords, word));

    // take the array of courses with the same title (generally different prefix)
    // check if any search word is closer edit distance to the prefix or number, to sort better
    const newResults: ResultWDistance[] = courseNameTable[title].map(
      (result) => ({
        distance: distances
          .map((dist, i) => {
            if (typeof result.prefix !== 'undefined') {
              const distToPrefix = editDistance(inputArr[i], result.prefix.toLowerCase());
              if (distToPrefix < dist) {
                return distToPrefix;
              }
            }
            if (typeof result.number !== 'undefined') {
              const distToNumber = editDistance(inputArr[i], result.number.toLowerCase());
              if (distToNumber < dist) {
                return distToNumber;
              }
            }
            return dist;
          })
          .reduce((partialSum, a) => partialSum + a, 0),
        title: title,
        result: result,
      }),
    );

    if (!results.length) {
      results.push(...newResults);
      results = results.slice(0, 10);
      continue;
    }
    newResults.forEach((result) => {
      const place = results.findIndex((x) => x.distance > result.distance);
      if (place !== -1) {
        // replace if already hit limit
        results.splice(
          place,
          results.length < LIMIT ? 0 : 1,
          result,
        );
      }
    });
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
