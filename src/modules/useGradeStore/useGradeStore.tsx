import { useState } from 'react';

import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { GradesData } from '@/pages/api/grades';

//Find GPA, total, and grade_distribution based on including some set of semesters
export function calculateGrades(
  grades: GradesData,
  academicSessions?: string[],
) {
  let grade_distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const session of grades) {
    if (
      typeof academicSessions === 'undefined' ||
      academicSessions.includes(session._id)
    ) {
      grade_distribution = grade_distribution.map(
        (item, i) => item + session.grade_distribution[i],
      );
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

//Fetch grades by academic session from nebula api
function fetchGradesData(
  course: SearchQuery,
  controller: AbortController,
): Promise<GradesType> {
  return fetch(
    '/api/grades?' +
      Object.keys(course)
        .map(
          (key) =>
            key +
            '=' +
            encodeURIComponent(String(course[key as keyof SearchQuery])),
        )
        .join('&'),
    {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.message !== 'success') {
        throw new Error(response.message);
      }
      if (response.data == null) {
        throw new Error('null data');
      }
      const calculated = calculateGrades(response.data);
      return {
        filtered: calculated,
        unfiltered: calculated,
        grades: response.data, //type GradesData
      };
    });
}

//Limit cached number of grades and rmp data entries
const MAX_ENTRIES = 1000;

interface Grades {
  [key: string]: GenericFetchedData<GradesType>;
}

export default function useGradeStore(): [
  Grades,
  (arg0: Grades | ((arg0: Grades) => Grades)) => void,
  (
    course: SearchQuery,
    controller: AbortController,
  ) => Promise<GradesType | null>,
  (course: SearchQuery) => void,
  (results: SearchQuery[], academicSessions: string[]) => void,
] {
  const [grades, setGrades] = useState<Grades>({});

  function addToGrades(key: string, value: GenericFetchedData<GradesType>) {
    setGrades((old) => {
      const newVal = { ...old };
      if (typeof newVal[key] !== 'undefined') {
        newVal[key] = value;
        return newVal;
      }
      if (Object.keys(newVal).length >= MAX_ENTRIES) {
        // Remove the oldest entry
        const oldestKey = Object.keys(newVal)[0];
        delete newVal[oldestKey];
      }
      newVal[key] = value;
      return newVal;
    });
  }

  //Call fetchGradesData and store response
  function fetchAndStoreGradesData(
    course: SearchQuery,
    controller: AbortController,
  ) {
    addToGrades(searchQueryLabel(course), { state: 'loading' });
    return fetchGradesData(course, controller)
      .then((res: GradesType) => {
        //Add to storage
        //Set loading status to done, unless total was 0 in calculateGrades
        addToGrades(searchQueryLabel(course), {
          state: res.unfiltered.gpa !== -1 ? 'done' : 'error',
          data: res,
        });
        return res;
      })
      .catch(() => {
        //Set loading status to error
        addToGrades(searchQueryLabel(course), { state: 'error' });
        return null;
      });
  }

  function recalcGrades(course: SearchQuery) {
    //Recalc gpa and such from past stored data for new page
    setGrades((oldGrades) => {
      const grades = { ...oldGrades };
      const entry = grades[searchQueryLabel(course)];
      if (entry && entry.state === 'done') {
        entry.data.unfiltered = calculateGrades(entry.data.grades);
      }
      return grades;
    });
  }

  function recalcAllGrades(results: SearchQuery[], academicSessions: string[]) {
    setGrades((oldGrades) => {
      const grades = { ...oldGrades };
      //Relavent keys
      for (const result of results) {
        const entry = grades[searchQueryLabel(result)];
        if (entry && entry.state === 'done') {
          entry.data.filtered = calculateGrades(
            entry.data.grades,
            academicSessions,
          );
        }
      }
      return grades;
    });
  }

  return [
    grades,
    setGrades,
    fetchAndStoreGradesData,
    recalcGrades,
    recalcAllGrades,
  ];
}
