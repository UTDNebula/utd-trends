'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

import { compareColors, plannerColors } from '@/modules/colors';
import {
  calculateGrades,
  type Grades,
  type GradesSummary,
} from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import { compareSemesters } from '@/modules/semesters';
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
  type SearchResult,
  sectionCanOverlap,
} from '@/types/SearchQuery';

type SetterValue<T> = T | ((prev: T) => T);
type Setter<T> = (value: SetterValue<T>) => void;

const SharedStateContext = createContext<
  | {
      grades: { [key: string]: GenericFetchedData<Grades> };
      filteredGrades: Record<string, GradesSummary>;
      setGrades: Setter<{ [key: string]: GenericFetchedData<Grades> }>;
      rmp: { [key: string]: GenericFetchedData<RMP> };
      setRmp: Setter<{ [key: string]: GenericFetchedData<RMP> }>;
      sections: { [key: string]: GenericFetchedData<Sections> };
      setSections: Setter<{ [key: string]: GenericFetchedData<Sections> }>;
      compare: SearchResult[];
      addToCompare: (query: SearchResult) => void;
      removeFromCompare: (query: SearchResult) => void;
      compareColorMap: { [key: string]: string };
      planner: SearchQueryMultiSection[];
      addToPlanner: (query: SearchQuery) => void;
      removeFromPlanner: (query: SearchQuery) => void;
      setPlannerSection: (query: SearchQuery, section: string) => void;
      plannerColorMap: {
        [key: string]: { fill: string; outline: string; font: string };
      };
      semesters: string[];
      chosenSemesters: string[];
      setChosenSemesters: Setter<string[]>;
      courseNames: { [key: string]: string | undefined };
      setCourseNames: Setter<{ [key: string]: string | undefined }>;
      latestSemester: string;
    }
  | undefined
>(undefined);

export function SharedStateProvider({
  children,
  latestSemester,
}: {
  children: React.ReactNode;
  latestSemester: string;
}) {
  const [grades, setGrades] = useState<{
    [key: string]: GenericFetchedData<Grades>;
  }>({});

  const [rmp, setRmp] = useState<{ [key: string]: GenericFetchedData<RMP> }>(
    {},
  );

  const [sections, setSections] = useState<{
    [key: string]: GenericFetchedData<Sections>;
  }>({});

  const [compare, setCompare] = useState<SearchResult[]>([]);

  const [chosenSemesters, setChosenSemesters] = useState<string[]>([]);
  const semesters = useMemo(() => {
    const allSemesters = [
      ...new Set(
        Object.values(grades)
          // remove errored
          .filter((grade) => grade.message === 'success')
          //remove grade data, just semesters
          .flatMap((grade) =>
            grade.data.grades.map((gradeSemester) => gradeSemester._id),
          )
          .sort((a, b) => compareSemesters(b, a)),
      ),
    ];
    setChosenSemesters(allSemesters);
    return allSemesters;
  }, [grades]);

  const filteredGrades = useMemo(() => {
    const build: Record<string, GradesSummary> = {};
    for (const key of Object.keys(grades)) {
      if (grades[key].message === 'success') {
        build[key] = calculateGrades(grades[key].data.grades, chosenSemesters);
      }
    }
    return build;
  }, [grades, chosenSemesters]);

  //Add a course+prof combo to compare (happens from search results)
  //copy over data basically
  function addToCompare(result: SearchResult) {
    //If not already there
    if (
      compare.every(
        (obj) => !searchQueryEqual(obj.searchQuery, result.searchQuery),
      )
    ) {
      //Add to list
      setCompare((prev) => [...prev, result]);
    }
  }

  //Remove a course+prof combo from compare
  function removeFromCompare(result: SearchResult) {
    //If already there
    if (
      compare.some((obj) =>
        searchQueryEqual(obj.searchQuery, result.searchQuery),
      )
    ) {
      //Remove from list
      setCompare((prev) => [
        ...prev.filter(
          (el) => !searchQueryEqual(el.searchQuery, result.searchQuery),
        ),
      ]);
    }
  }

  const compareColorMap = Object.fromEntries(
    compare.map((key, index) => [
      searchQueryLabel(key.searchQuery),
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

  const [courseNames, setCourseNames] = useState<{
    [key: string]: string | undefined;
  }>({});

  return (
    <SharedStateContext.Provider
      value={{
        grades,
        setGrades,
        filteredGrades,
        rmp,
        setRmp,
        sections,
        setSections,
        compare,
        addToCompare,
        removeFromCompare,
        compareColorMap,
        planner,
        addToPlanner,
        removeFromPlanner,
        setPlannerSection,
        plannerColorMap,
        semesters,
        chosenSemesters,
        setChosenSemesters,
        courseNames,
        setCourseNames,
        latestSemester,
      }}
    >
      {children}
    </SharedStateContext.Provider>
  );
}

export function useSharedState() {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
}
