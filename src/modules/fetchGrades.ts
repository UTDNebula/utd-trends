import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

type GradesSummary = {
  mean_gpa: number;
  gpa: number;
  total: number;
  grade_distribution: number[];
};

type GradesData = {
  _id: string;
  data: {
    type: string;
    grade_distribution: number[];
  }[];
}[];

export type Grades = {
  filtered: GradesSummary;
  unfiltered: GradesSummary;
  grades: GradesData;
};

//Find GPA, total, and grade_distribution based on including some set of semesters and section types
export function calculateGrades(
    grades: GradesData,
    semesters?: string[],
    sectionTypes?: string[],
) {
  let grade_distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const session of grades) {
    if (typeof semesters === 'undefined' || semesters.includes(session._id)) {
      for (const sectionData of session.data) {
        if (typeof sectionTypes === 'undefined' || sectionTypes.includes(sectionData.type)) {
          grade_distribution = grade_distribution.map(
              (item, i) => item + sectionData.grade_distribution[i],
          );
        }
      }
    }
  }

  const total: number = grade_distribution.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );

  const GPALookup = [
    4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
  ];
  let mean_gpa = -1;
  if (total !== 0) {
    mean_gpa =
      GPALookup.reduce(
        (accumulator, currentValue, index) =>
          accumulator + currentValue * grade_distribution[index],
        0,
      ) /
      (total - grade_distribution[grade_distribution.length - 1]);
  }

  let median_gpa = -1;
  let medianIndex = -1;
  if (total != 0) {
    let i = Math.floor(total / 2);
    while (i > 0) {
      medianIndex++;
      i -= grade_distribution[medianIndex];
    }
    median_gpa = GPALookup[medianIndex];
  }

  return {
    mean_gpa: mean_gpa,
    gpa: median_gpa,
    total: total,
    grade_distribution: grade_distribution,
  };
}

export default async function fetchGrades(
  query: SearchQuery,
): Promise<GenericFetchedData<Grades>> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return { message: 'error', data: 'API key is undefined' };
  }

  try {
    const url = new URL('https://api.utdnebula.com/grades/semester/sectionType');
    if (typeof query.prefix === 'string') {
      url.searchParams.append('prefix', query.prefix);
    }
    if (typeof query.number === 'string') {
      url.searchParams.append('number', query.number);
    }
    if (
      typeof query.profFirst === 'string' &&
      typeof query.profLast === 'string'
    ) {
      url.searchParams.append('first_name', query.profFirst);
      url.searchParams.append('last_name', query.profLast);
    }
    const res = await fetch(url.href, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (data.message !== 'success') {
      throw new Error(data.data ?? data.message);
    }

    const calculated = calculateGrades(data.data);

    return {
      message: 'success',
      data: {
        filtered: calculated,
        unfiltered: calculated,
        grades: data.data, //type GradesData
      },
    };
  } catch (error) {
    return {
      message: 'error',
      data:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
