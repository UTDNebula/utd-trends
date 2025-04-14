'use client';

import React, { createContext, useContext, useState } from 'react';

import {
  convertToCourseOnly,
  removeSection,
  type SearchQuery,
  searchQueryEqual,
  type SearchQueryMultiSection,
  sectionCanOverlap,
  convertToCourseOnly,
  removeDuplicates,
  searchQueryLabel,
} from '@/types/SearchQuery';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import { compareColors, plannerColors } from '@/modules/colors';
import usePersistantState from '@/modules/usePersistantState';

const SharedStateContext = createContext<any>(null);

export const SharedStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [grades, setGrades] = useState<{
    [key: string]: GenericFetchedData<Grades>;
  }>([]);
  const [rmp, setRmp] = useState<{ [key: string]: GenericFetchedData<RMP> }>(
    [],
  );
  const [sections, setSections] = useState<{
    [key: string]: GenericFetchedData<Sections>;
  }>([]);

  const [compare, setCompare] = useState<SearchQuery[]>([]);
  const [compareGrades, setCompareGrades] = useState<{
    [key: string]: GenericFetchedData<Grades>;
  }>([]);
  const [compareRmp, setCompareRmp] = useState<{
    [key: string]: GenericFetchedData<RMP>;
  }>([]);

  //Add a course+prof combo to compare (happens from search results)
  //copy over data basically
  function addToCompare(searchQuery: SearchQuery) {
    //If not already there
    if (compare.every((obj) => !searchQueryEqual(obj, searchQuery))) {
      //Add to list
      setCompare((old) => old.concat([searchQuery]));
      //Save grade data
      setCompareGrades((old) => {
        return {
          ...old,
          [searchQueryLabel(searchQuery)]:
            grades[searchQueryLabel(searchQuery)],
        };
      });
      //Save prof data
      if (typeof searchQuery.profLast !== 'undefined') {
        setCompareRmp((old) => {
          return {
            ...old,
            [searchQueryLabel(convertToProfOnly(searchQuery))]:
              rmp[searchQueryLabel(convertToProfOnly(searchQuery))],
          };
        });
      }
    }
  }

  //Remove a course+prof combo from compare
  function removeFromCompare(searchQuery: SearchQuery) {
    //If already there
    if (compare.some((obj) => searchQueryEqual(obj, searchQuery))) {
      //Remove from list
      setCompare((old) =>
        old.filter((el) => !searchQueryEqual(el, searchQuery)),
      );
      //Remove from saved grade data
      setCompareGrades((old) => {
        delete old[searchQueryLabel(searchQuery)];
        return old;
      });
      //If no other courses in compare have the same professor
      if (
        !compare
          .filter((el) => !searchQueryEqual(el, searchQuery))
          .some((el) => searchQueryEqual(el, convertToProfOnly(searchQuery)))
      ) {
        //Remove from saved rmp data
        setCompareRmp((old) => {
          delete old[searchQueryLabel(convertToProfOnly(searchQuery))];
          return old;
        });
      }
    }
  }

  const compareColorMap: { [key: string]: string } = Object.fromEntries(
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
  function addToPlanner(searchQuery: SearchQuery) {
    setPlanner((old: SearchQueryMultiSection[]) => {
      //If not already there
      if (old.findIndex((obj) => searchQueryEqual(obj, searchQuery)) === -1) {
        //Add to list
        return old.concat([searchQuery]);
      }
      return old;
    });
  }

  //Remove a course+prof combo from compare
  function removeFromPlanner(searchQuery: SearchQuery) {
    setPlanner((old: SearchQueryMultiSection[]) => {
      //If already there
      if (planner.some((obj) => searchQueryEqual(obj, searchQuery))) {
        //Remove to list
        return old.filter((el) => !searchQueryEqual(el, searchQuery));
      }
      return old;
    });
  }

  function setPlannerSection(searchQuery: SearchQuery, section: string) {
    setPlanner((old: SearchQueryMultiSection[]) =>
      old.map((course) => {
        if (
          searchQueryEqual(removeSection(course), removeSection(searchQuery))
        ) {
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
            convertToCourseOnly(searchQuery),
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

  const plannerColorMap: { [key: string]: string } = Object.fromEntries(
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
        setCompare,
        compareGrades,
        setCompareGrades,
        compareRmp,
        setCompareRmp,
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
