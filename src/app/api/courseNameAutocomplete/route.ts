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

const LIMIT = 20;

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

  const results: ResultWDistance[] = [];

  const str: ResultWDistance[] = [];
  // check each course name
  for (const title in courseNameTable) {
    const titleWords = title.toLowerCase().split(' ');

    // for each word in query, find the word in the course name that is most similar
    // const distances = inputArr.map((word) => minEditDistance(titleWords, word));
    //for each word in the course name, find the word in the query that is most similar
    const distances = titleWords.map((word) => minEditDistance(inputArr, word));
    if (titleWords.includes('machine') && titleWords.includes('learning')) {
      console.log(
        title,
        titleWords.map((word) => ({
          word: word,
          dist: minEditDistance(inputArr, word),
        })),
        titleWords
          .map((word) => minEditDistance(inputArr, word))
          .sort((a, b) => a - b)
          .reduce(
            (partialSum, dist, i) => partialSum + Math.pow(0.5, i) * dist,
            0,
          ),
        1 -
          inputArr
            .map((q) =>
              titleWords
                .map((tw) => (tw == q ? 1 : (0 as number)))
                .reduce((a, b) => a + b, 0),
            )
            .reduce((a, b) => a + b, 0) /
            (titleWords.length == 0 ? 1 : titleWords.length),
        inputArr
          .map((word) =>
            titleWords.some((tw) => tw.includes(word)) ? -10 : (0 as number),
          )
          .reduce((a, b) => a + b, 0),
      );
    }
    // take the array of courses with the same title (generally different prefix)
    // check if any search word is closer edit distance to the prefix or number, to sort better
    const newResults: ResultWDistance[] = courseNameTable[title].map(
      (result) => ({
        distance:
          distances
            .map((dist) => {
              // if (typeof result.prefix !== 'undefined') {
              //   const distToPrefix = editDistance(
              //     inputArr[i],
              //     result.prefix.toLowerCase(),
              //   );
              //   if (distToPrefix == 0) {
              //     return -.01
              //   }
              //   if (distToPrefix < dist) {
              //     return distToPrefix;
              //   }
              // }
              // if (typeof result.number !== 'undefined') {
              //   const distToNumber = editDistance(
              //     inputArr[i],
              //     result.number.toLowerCase(),
              //   );
              //   if (distToNumber < dist) {
              //     return distToNumber;
              //   }
              // }
              return dist;
            })
            .sort((a, b) => a - b)
            .reduce(
              (partialSum, dist, i) => partialSum + Math.pow(0.6, i) * dist,
              0,
            ) /* / title.length * 0.6 */ +
          (titleWords.length >= inputArr.length
            ? 1 -
              inputArr
                .map((q) =>
                  titleWords
                    .map((tw) => (tw == q ? 1 : (0 as number)))
                    .reduce((a, b) => a + b, 0),
                )
                .reduce((a, b) => a + b, 0) /
                (titleWords.length == 0 ? 1 : titleWords.length)
            : 0) +
          inputArr
            .map((word) =>
              titleWords.some((tw) => tw.includes(word)) ? -10 : (0 as number),
            )
            .reduce((a, b) => a + b, 0),
        /*+ inputArr.map((word) => result.prefix?.toLowerCase() == word || result.number == word ? -1 : 0 as number).reduce((a, b) => a + b, 0) * 0.2*/ title:
          title,
        result: result,
      }),
    );

    const s = newResults.filter(
      (x) => x.title == 'Introduction to Machine Learning',
    );
    if (s.length > 0) {
      str.push(...s);
    }

    newResults.forEach((result) => {
      if (results.length < LIMIT) {
        // If not at limit, just add it
        results.push(result);
        results.sort((a, b) => a.distance - b.distance);
      } else {
        // If at limit, replace worst result if this one is better
        const worstIndex = results.length - 1;
        if (result.distance < results[worstIndex].distance) {
          results[worstIndex] = result;
          results.sort((a, b) => a.distance - b.distance);
        }
      }
    });
  }

  console.log(results);
  console.log(str);
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
