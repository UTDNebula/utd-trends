import type { Metadata } from 'next';
import React from 'react';

import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import type { Grades } from '@/modules/fetchGrades';
import { fetchGrades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import { fetchRmp } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import { fetchSections } from '@/modules/fetchSections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  removeDuplicates,
  type SearchQuery,
  searchQueryLabel,
} from '@/types/SearchQuery';

import Planner from './Planner';

export const metadata: Metadata = {
  title: 'My Planner' + title,
  description:
    "Choose the perfect classes for you: Nebula Labs's schedule planner to help you build an informed schedule with UT Dallas grade and Rate My Professors data.",
};

export async function fetchPlannerData(queries: SearchQuery[]): Promise<{
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

  const [gradesResults, rmpResults, sectionsResults] = await Promise.allSettled(
    [
      Promise.allSettled(Object.values(gradesPromises)),
      Promise.allSettled(Object.values(rmpPromises)),
      Promise.allSettled(Object.values(sectionsPromises)),
    ],
  );

  const gradesKeys = Object.keys(gradesPromises);
  const rmpKeys = Object.keys(rmpPromises);
  const sectionsKeys = Object.keys(sectionsPromises);

  const grades = Object.fromEntries(
    gradesKeys.map((key, i) => [key, gradesResults[i]]),
  );
  const rmp = Object.fromEntries(rmpKeys.map((key, i) => [key, rmpResults[i]]));
  const sections = Object.fromEntries(
    sectionsKeys.map((key, i) => [key, sectionsResults[i]]),
  );

  return {
    grades,
    rmp,
    sections,
  };
}

/**
 * Returns the My Planner page
 */
export default function Page() {
  return (
    <>
      <TopMenu isPlanner={true} />
      <main className="p-4">
        <Planner fetchPlannerData={fetchPlannerData} />
      </main>
    </>
  );
}
