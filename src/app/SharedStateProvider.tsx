'use client';

import React, { createContext, useContext, useState } from 'react';

import { compareColors, plannerColors } from '@/modules/colors';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import usePersistantState from '@/modules/usePersistantState';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  removeDuplicates,
  removeSection,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQueryMultiSection,
  sectionCanOverlap,
} from '@/types/SearchQuery';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

const SharedStateContext = createContext<{
  grades: { [key: string]: GenericFetchedData<Grades> };
  setGrades: Setter<{ [key: string]: GenericFetchedData<Grades> }>;
  rmp: { [key: string]: GenericFetchedData<RMP> };
  setRmp: Setter<{ [key: string]: GenericFetchedData<RMP> }>;
  sections: { [key: string]: GenericFetchedData<Sections> };
  setSections: Setter<{ [key: string]: GenericFetchedData<Sections> }>;
  compare: SearchQuery[];
  addToCompare: (query: SearchQuery) => void;
  removeFromCompare: (query: SearchQuery) => void;
  compareGrades: { [key: string]: GenericFetchedData<Grades> };
  compareRmp: { [key: string]: GenericFetchedData<RMP> };
  compareColorMap: { [key: string]: string };
  planner: SearchQueryMultiSection[];
  addToPlanner: (query: SearchQuery) => void;
  removeFromPlanner: (query: SearchQuery) => void;
  setPlannerSection: (query: SearchQuery, section: string) => void;
  plannerColorMap: {
    [key: string]: { fill: string; outline: string; font: string };
  };
}>(null);

export const SharedStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [grades, setGrades] = useState<{
    [key: string]: GenericFetchedData<Grades>;
  }>({});
  const [rmp, setRmp] = useState<{ [key: string]: GenericFetchedData<RMP> }>(
    {},
  );
  const [sections, setSections] = useState<{
    [key: string]: GenericFetchedData<Sections>;
  }>({});

  const [compare, setCompare] = useState<SearchQuery[]>([]);
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GenericFetchedData<Grades>;
  }>({});
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: GenericFetchedData<RMP>;
  }>({});

  //Add a course+prof combo to compare (happens from search results)
  //copy over data basically
  function addToCompare(query: SearchQuery) {
    //If not already there
    if (compare.every((obj) => !searchQueryEqual(obj, query))) {
      //Add to list
      setCompare((prev) => prev.concat([query]));
      //Save grade data
      setCompareGrades((prev) => {
        return {
          ...prev,
          [searchQueryLabel(query)]: grades[searchQueryLabel(query)],
        };
      });
      //Save prof data
      if (typeof query.profLast !== 'undefined') {
        setCompareRmp((prev) => {
          return {
            ...prev,
            [searchQueryLabel(convertToProfOnly(query))]:
              rmp[searchQueryLabel(convertToProfOnly(query))],
          };
        });
      }
    }
  }

  //Remove a course+prof combo from compare
  function removeFromCompare(query: SearchQuery) {
    //If already there
    if (compare.some((obj) => searchQueryEqual(obj, query))) {
      //Remove from list
      setCompare((prev) => prev.filter((el) => !searchQueryEqual(el, query)));
      //Remove from saved grade data
      setCompareGrades((prev) => {
        delete prev[searchQueryLabel(query)];
        return prev;
      });
      //If no other courses in compare have the same professor
      if (
        !compare
          .filter((el) => !searchQueryEqual(el, query))
          .some((el) => searchQueryEqual(el, convertToProfOnly(query)))
      ) {
        //Remove from saved rmp data
        setCompareRmp((prev) => {
          delete prev[searchQueryLabel(convertToProfOnly(query))];
          return prev;
        });
      }
    }
  }

  const compareColorMap = Object.fromEntries(
    Object.entries(compare).map(([key], index) => [
      key,
      compareColors[index % compareColors.length],
    ]),
  );

  //Store course+prof combos in planner
  const [planner, setPlanner] = usePersistantState<SearchQueryMultiSection[]>(
    'planner',
    [],
  );

  //Add a course+prof combo to planner (happens from search results)
  function addToPlanner(query: SearchQuery) {
    setPlanner((prev: SearchQueryMultiSection[]) => {
      //If not already there
      if (prev.findIndex((obj) => searchQueryEqual(obj, query)) === -1) {
        //Add to list
        return prev.concat([query]);
      }
      return prev;
    });
  }

  //Remove a course+prof combo from compare
  function removeFromPlanner(query: SearchQuery) {
    setPlanner((prev: SearchQueryMultiSection[]) => {
      //If already there
      if (planner.some((obj) => searchQueryEqual(obj, query))) {
        //Remove to list
        return prev.filter((el) => !searchQueryEqual(el, query));
      }
      return prev;
    });
  }

  function setPlannerSection(query: SearchQuery, section: string) {
    setPlanner((prev: SearchQueryMultiSection[]) =>
      prev.map((course) => {
        if (searchQueryEqual(removeSection(course), removeSection(query))) {
          if (typeof course.sectionNumbers === 'undefined') {
            return { ...course, sectionNumbers: [section] };
          }
          if (course.sectionNumbers.includes(section)) {
            return {
              ...course,
              sectionNumbers: course.sectionNumbers.filter(
                (s) => s !== section,
              ),
            };
          } else {
            let newSections = course.sectionNumbers;
            if (!sectionCanOverlap(section)) {
              newSections = newSections.filter((s) => sectionCanOverlap(s));
            }
            return {
              ...course,
              sectionNumbers: newSections.concat([section]),
            };
          }
        } else if (
          searchQueryEqual(
            convertToCourseOnly(course),
            convertToCourseOnly(query),
          ) &&
          typeof course.sectionNumbers !== 'undefined'
        ) {
          //to remove from a different combo
          return {
            ...course,
            sectionNumbers: course.sectionNumbers.filter((s) =>
              sectionCanOverlap(s),
            ),
          };
        }
        return course;
      }),
    );
  }

  const plannerColorMap = Object.fromEntries(
    removeDuplicates(planner.map(convertToCourseOnly)).map((key, index) => [
      searchQueryLabel(key),
      plannerColors[index % plannerColors.length],
    ]),
  );

  return (
    <SharedStateContext.Provider
      value={{
        grades,
        setGrades,
        rmp,
        setRmp,
        sections,
        setSections,
        compare,
        addToCompare,
        removeFromCompare,
        compareGrades,
        compareRmp,
        compareColorMap,
        planner,
        addToPlanner,
        removeFromPlanner,
        setPlannerSection,
        plannerColorMap,
      }}
    >
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => useContext(SharedStateContext);
