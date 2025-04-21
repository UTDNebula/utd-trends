'use server';

import fetchGrades, { type Grades } from '@/modules/fetchGrades';
import fetchRmp, { type RMP } from '@/modules/fetchRmp';
import fetchSections, { type Sections } from '@/modules/fetchSections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToProfOnly,
  removeDuplicates,
  type SearchQuery,
  searchQueryLabel,
} from '@/types/SearchQuery';

export default async function fetchAll(queries: SearchQuery[]): Promise<{
  grades: { [key: string]: GenericFetchedData<Grades> };
  rmp: { [key: string]: GenericFetchedData<RMP> };
  sections: { [key: string]: GenericFetchedData<Sections> };
}> {
  //Grade data
  //Fetch each result
  const gradesPromises = Object.fromEntries(
    queries.map((result) => [searchQueryLabel(result), fetchGrades(result)]),
  );

  //RMP data
  //Get list of profs from queries
  //Remove duplicates so as not to fetch multiple times
  const rmpPromises = Object.fromEntries(
    removeDuplicates(
      queries
        //Remove course data from each
        .map((result) => convertToProfOnly(result))
        //Remove empty objects (used to be only course data)
        .filter((obj) => Object.keys(obj).length !== 0) as SearchQuery[],
    ).map((result) => [searchQueryLabel(result), fetchRmp(result)]),
  );

  const sectionsPromises = Object.fromEntries(
    queries.map((result) => [searchQueryLabel(result), fetchSections(result)]),
  );

  const [gradesResults, rmpResults, sectionsResults] = await Promise.all([
    Promise.allSettled(Object.values(gradesPromises)),
    Promise.allSettled(Object.values(rmpPromises)),
    Promise.allSettled(Object.values(sectionsPromises)),
  ]);

  const gradesKeys = Object.keys(gradesPromises);
  const rmpKeys = Object.keys(rmpPromises);
  const sectionsKeys = Object.keys(sectionsPromises);

  const grades = Object.fromEntries(
    gradesKeys.flatMap((key, i) => {
      const result = gradesResults[i];
      return result.status === 'fulfilled' ? [[key, result.value]] : [];
    }),
  );
  const rmp = Object.fromEntries(
    rmpKeys.flatMap((key, i) => {
      const result = rmpResults[i];
      return result.status === 'fulfilled' ? [[key, result.value]] : [];
    }),
  );
  const sections = Object.fromEntries(
    sectionsKeys.flatMap((key, i) => {
      const result = sectionsResults[i];
      return result.status === 'fulfilled' ? [[key, result.value]] : [];
    }),
  );

  return {
    grades,
    rmp,
    sections,
  };
}
