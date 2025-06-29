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

/** Checks if the query word is/partially a prefix and @returns potential prefix matches */
function isPotentialPrefix(query: string): string[] {
  const prefixMatch = query.match(/^[A-Za-z]+/);
  if (!prefixMatch) return [];
  const extractedPrefix = prefixMatch[0];

  return coursePrefixes.filter((prefix) =>
    prefix.toLowerCase().startsWith(extractedPrefix.toLowerCase()),
  );
}

/** Checks if query word is 1-4 digits and @returns the exctracted 4 digits if valid or a blank string */
function isPotentialCourseNumber(query: string): string {
  // Extract numeric part with optional 'v' in second position (digits at the end or standalone)
  const numberMatch = query.match(/\d+[vV]?\d*$/);
  if (!numberMatch) return '';
  const extractedNumber = numberMatch[0];

  // Check if it's 1-4 characters and follows the pattern: digit + optional 'v' + digits
  // Valid patterns: 1-4 digits OR digit + v + 1-2 digits
  const isValid = /^(\d{1,4}|\d[vV]\d{1,2})$/.test(extractedNumber);

  return isValid ? extractedNumber : '';
}

/** @returns length of the longest common substring between the 2 strings that starts at the beginning of str1 */
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

/** @returns the distance to the closest query word to one title word
 * @param queries - array of query words
 * @param word - a single word from the course title
 */
function minEditDistance(queries: string[], word: string) {
  return queries.length > 0 && word.length > 0
    ? Math.min(...queries.map((query) => editDistance(query, word)))
    : 10000;
}

/** Fuzzy matches word with target by using editDistance */
function findSimilarity(word: string, target: string): number {
  // Fuzzy matching for typos
  const distance = editDistance(word.toLowerCase(), target.toLowerCase());
  const maxLen = Math.max(word.length, target.length);
  return 1 - distance / maxLen;
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
  // isolate potential prefixes and course numbers so they aren't treated as words
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

  // check each course name
  for (const title in courseNameTable) {
    const titleWords = title
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0);

    //for each word in the course name, find the word in the query that is most similar
    const distances = titleWords.map((word) => minEditDistance(inputArr, word));

    // take the array of courses with the same title (generally different prefix)
    // check metrics of distance, word capture, prefix priority, number match
    const newResults: ResultWDistance[] = courseNameTable[title].map(
      (result) => {
        // edit distance between the course title and query words, with a discounted weight on more distant words
        const distanceMetric = distances
          .sort((a, b) => a - b)
          .reduce(
            (partialSum, dist, i) => partialSum + Math.pow(0.7, i) * dist, // discount weight by 0.7^i
            0,
          );
        // How much of the query is captured by the title words
        const smartWordCapture = inputArr
          .map((word) => {
            let bestScore = 0;

            titleWords.forEach((tw) => {
              // For each title word
              // Exact inclusion (original behavior)
              if (tw.includes(word)) {
                bestScore = Math.min(bestScore, -10);
                return;
              }

              const similarity = findSimilarity(word, tw);
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
        // boosts it if the prefix matches
        const prefixPriority = prefixes.includes(result.prefix ?? '') ? -10 : 0;
        // boosts it if the course number matches (fuzzy - allows spelling mistakes)
        const smartNumberMatch =
          courseNumbers
            .map((number) => {
              if (result.number) {
                const prefixScore = longestCommonPrefix(number, result.number); // show numbers that differ by the last digit higher
                const similarity = findSimilarity(number, result.number);
                if (similarity > 0.9) {
                  return -10 * similarity - prefixScore;
                } else if (similarity > 0.7) {
                  return -8 * similarity - prefixScore;
                } else if (similarity > 0.5) {
                  return -3 * similarity - prefixScore;
                }
              }
              return 0;
            })
            .sort((a, b) => b - a)[0] ?? 0;

        return {
          distance:
            (smartNumberMatch < 0 ? 0 : distanceMetric) + // if checking course number, ignore distance metric
            2 * smartWordCapture + // double weight for word capture
            prefixPriority +
            smartNumberMatch,
          title: title,
          result: result,
        };
      },
    );

    // add to results if it fits
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
  // calculate cutoff for 1 standard deviation
  const cut = results[Math.floor(0)].distance;
  const variance =
    results.reduce((sum, d) => sum + Math.pow(d.distance - cut, 2), 0) /
    results.length; // Calculate variance
  const stdDev = Math.sqrt(variance); // Calculate standard deviation
  const oneStdCutoff = cut + 1 * stdDev; // 1 standard deviation cutoff
  const resultsWithoutDistance: Result[] = results
    .filter((r) => r.distance <= oneStdCutoff)
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
