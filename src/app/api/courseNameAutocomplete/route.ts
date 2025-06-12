import { NextResponse } from 'next/server';

import untypedCourseNameTable from '@/data/course_name_table.json';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

const courseNameTable = untypedCourseNameTable as {
  [key: string]: SearchQuery[];
};

//find all the prefixes in the course name table
const coursePrefixes = Array.from(
  new Set(
    Object.values(courseNameTable)
      .flat()
      .map((query) => query.prefix),
  ),
).filter(
  (prefix): prefix is string => typeof prefix === 'string' && prefix.length > 0,
);

function isPotentialPrefix(query: string): string[] {
  const prefixMatch = query.match(/^[A-Za-z]+/);
  if (!prefixMatch) return [];
  const extractedPrefix = prefixMatch[0];

  return coursePrefixes.filter((prefix) =>
    prefix.toLowerCase().startsWith(extractedPrefix.toLowerCase()),
  );
}

function isPotentialCourseNumber(query: string): string {
  // Extract numeric part with optional 'v' in second position (digits at the end or standalone)
  const numberMatch = query.match(/\d+[vV]?\d*$/);
  if (!numberMatch) return '';
  const extractedNumber = numberMatch[0];

  // Check if it's 1-4 characters and follows the pattern: digit + optional 'v' + digits
  // Valid patterns: 1-4 digits OR digit + v + 1-2 digits (total 3-4 chars)
  const isValid = /^(\d{1,4}|\d[vV]\d{1,2})$/.test(extractedNumber);

  return isValid ? extractedNumber : '';
}

function longestCommonPrefix(str1: string, str2: string): number {
  let count = 0;
  const minLength = Math.min(str1.length, str2.length);

  for (let i = 0; i < minLength; i++) {
    if (str1.toLowerCase()[i] === str2.toLowerCase()[i]) {
      count++;
    } else {
      break; // Stop at first mismatch
    }
  }

  return count;
}

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
  const inputWords = input.split(' ').filter((word) => word.length > 0);
  const inputArr = inputWords.filter(
    (word) =>
      isPotentialPrefix(word).length == 0 &&
      isPotentialCourseNumber(word).length == 0,
  );
  const prefixes = inputWords.map((word) => isPotentialPrefix(word)).flat();
  const courseNumbers = inputWords
    .map((word) => isPotentialCourseNumber(word))
    .filter((word) => word.length > 0);

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
      (result) => {
        const distanceMetric = distances
          .sort((a, b) => a - b)
          .reduce(
            (partialSum, dist, i) => partialSum + Math.pow(0.7, i) * dist,
            0,
          );
        // const coverage =
        //   titleWords.length >= inputArr.length
        //     ? 1 -
        //       inputArr
        //         .map((q) =>
        //           titleWords
        //             .map((tw) => (tw == q ? 1 : (0 as number)))
        //             // .map((tw) => (tw.startsWith(q) ? (q.length / tw.length): (0 as number)))
        //             .reduce((a, b) => a + b, 0),
        //         )
        //         .reduce((a, b) => a + b, 0) /
        //         (titleWords.length == 0 ? 1 : titleWords.length)
        //     : 0;
        // const wordCapture = inputArr
        //   .map((word) =>
        //     titleWords.some((tw) => tw.includes(word)) ? -10 : (0 as number),
        //   )
        //   .reduce((a, b) => a + b, 0);
        const smartWordCapture = inputArr
          .map((word) => {
            let bestScore = 0;

            titleWords.forEach((tw) => {
              // Exact inclusion (original behavior)
              if (tw.includes(word)) {
                bestScore = Math.min(bestScore, -10);
                return;
              }

              // Fuzzy matching for typos
              const distance = editDistance(
                word.toLowerCase(),
                tw.toLowerCase(),
              );
              const maxLen = Math.max(word.length, tw.length);
              const similarity = 1 - distance / maxLen;

              if (similarity > 0.7) {
                bestScore = Math.min(bestScore, -8 * similarity);
              }
              if (similarity > 0.5) {
                bestScore = Math.min(bestScore, -3 * similarity);
              }
            });

            return bestScore;
          })
          .reduce((a, b) => a + b, 0);
        const prefixPriority = prefixes.includes(result.prefix ?? '') ? -10 : 0;
        const numberMatch =
          -3 *
          (courseNumbers
            .map((number) => longestCommonPrefix(number, result.number ?? ''))
            .sort((a, b) => b - a)[0] ?? 0);
        // const lengthPenalty = (titleWords.length - inputArr.length) * 0.7;
        if (result.prefix == 'CS' && result.number == '4348')
          console.log(
            'abc',
            title,
            prefixes,
            prefixPriority,
            courseNumbers,
            numberMatch,
          );
        // distanceMetric += inputArr.map((term) => {
        //   if (typeof result.number !== 'undefined') {
        //     const distToNumber = editDistance(
        //       term,
        //       result.number.toLowerCase(),
        //     );
        //     return distToNumber / Math.max(result.number.length, term.length) - 1;
        //   }
        //   return 0;
        // }).sort((a, b) => a - b)[0];

        return {
          // breakdown: {
          //   distanceMetric: distanceMetric,
          //   coverage: coverage,
          //   wordCapture: wordCapture,
          //   smartWordCapture: smartWordCapture,
          //   prefixPriority: prefixPriority,
          //   numberMatch: numberMatch,
          //   lengthPenalty: lengthPenalty,
          // },
          distance:
            distanceMetric +
            // coverage +
            // wordCapture +
            2 * smartWordCapture +
            prefixPriority +
            numberMatch +
            // lengthPenalty +
            0,
          /*+ inputArr.map((word) => result.prefix?.toLowerCase() == word || result.number == word ? -1 : 0 as number).reduce((a, b) => a + b, 0) * 0.2*/ title:
            title,
          result: result,
        };
      },
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

  console.log('baweru', results);
  console.log(str);
  const cut = results[Math.floor(0)].distance;
  // Calculate variance
  const variance =
    results.reduce((sum, d) => sum + Math.pow(d.distance - cut, 2), 0) /
    results.length;
  // Calculate standard deviation
  const stdDev = Math.sqrt(variance);
  // 1 standard deviation cutoff
  const oneStdCutoff = cut + 1 * stdDev; // For your negative scoring system
  console.log(cut, oneStdCutoff);
  const resultsWithoutDistance: Result[] = results
    .filter((r) => r.distance < oneStdCutoff)
    .map((result) => ({
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
