'use client';

import { compareColors, plannerColors } from '@/modules/colors';
import usePersistantState from '@/modules/usePersistantState';
import {
  convertToCourseOnly,
  removeDuplicates,
  removeSection,
  searchQueryEqual,
  searchQueryLabel,
  sectionCanOverlap,
  type PlannerEntry,
  type SearchQuery,
  type SearchQueryMultiSection,
  type SearchResult,
} from '@/types/SearchQuery';
import React, { createContext, useContext, useState } from 'react';

type SetterValue<T> = T | ((prev: T) => T);
type Setter<T> = (value: SetterValue<T>) => void;

function resolveTeachingSemester(
  availableSemesters: string[],
  ...candidates: (string | null | undefined)[]
): string {
  for (const candidate of candidates) {
    if (candidate && availableSemesters.includes(candidate)) {
      return candidate;
    }
  }
  return availableSemesters[0] ?? '';
}

const SharedStateContext = createContext<
  | {
      compare: SearchResult[];
      addToCompare: (query: SearchResult) => void;
      removeFromCompare: (query: SearchResult) => void;
      compareColorMap: { [key: string]: string };
      planner: PlannerEntry[];
      addToPlanner: (query: SearchQuery, semester: string) => void;
      removeFromPlanner: (query: SearchQuery, semester: string) => void;
      setPlannerSection: (query: SearchQuery, section: string) => void;
      plannerColorMap: {
        [key: string]: { fill: string; outline: string; font: string };
      };
      courseNames: { [key: string]: string | undefined };
      setCourseNames: Setter<{ [key: string]: string | undefined }>;
      availableSemesters: string[];
      teachingSemester: string;
      setTeachingSemester: (semester: string) => void;
      effectiveTeachingSemester: string;
    }
  | undefined
>(undefined);

export function SharedStateProvider({
  children,
  availableSemesters,
  defaultTeachingSemester,
}: {
  children: React.ReactNode;
  availableSemesters: string[];
  defaultTeachingSemester: string;
}) {
  const [teachingSemester, setTeachingSemester] = useState<string>(
    defaultTeachingSemester,
  );
  const effectiveTeachingSemester = resolveTeachingSemester(
    availableSemesters,
    teachingSemester,
    defaultTeachingSemester,
  );
  const [compare, setCompare] = useState<SearchResult[]>([]);

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

  //Store planner entries (query + semester added for)
  const [planner, setPlanner] = usePersistantState<PlannerEntry[]>(
    'planner_v2',
    [],
  );

  //Add a course+prof combo to planner (happens from search results); semester = selected semester when adding
  function addToPlanner(query: SearchQuery, semester: string) {
    setPlanner((prev) => {
      if (
        prev.some(
          (e) => searchQueryEqual(e.query, query) && e.semester === semester,
        )
      )
        return prev;
      return prev.concat([{ query, semester }]);
    });
  }

  function removeFromPlanner(query: SearchQuery, semester: string) {
    setPlanner((prev) => {
      return prev.filter(
        (e) => !(searchQueryEqual(e.query, query) && e.semester === semester),
      );
    });
  }

  function setPlannerSection(query: SearchQuery, section: string) {
    setPlanner((prev) => {
      const hasMatchingRow = prev.some(
        (e) =>
          e.semester === effectiveTeachingSemester &&
          searchQueryEqual(removeSection(e.query), removeSection(query)),
      );

      const base = hasMatchingRow
        ? prev
        : prev.concat([
            {
              query: removeSection(query) as SearchQueryMultiSection,
              semester: effectiveTeachingSemester,
            },
          ]);

      return base.map((entry) => {
        if (entry.semester !== effectiveTeachingSemester) return entry;

        const course = entry.query;
        if (searchQueryEqual(removeSection(course), removeSection(query))) {
          if (typeof course.sectionNumbers === 'undefined') {
            return {
              ...entry,
              query: { ...course, sectionNumbers: [section] },
            };
          }
          if (course.sectionNumbers.includes(section)) {
            return {
              ...entry,
              query: {
                ...course,
                sectionNumbers: course.sectionNumbers.filter(
                  (s) => s !== section,
                ),
              },
            };
          }
          let newSections = course.sectionNumbers;
          if (!sectionCanOverlap(section)) {
            newSections = newSections.filter((s) => sectionCanOverlap(s));
          }
          return {
            ...entry,
            query: {
              ...course,
              sectionNumbers: [section]
                .concat(newSections)
                .filter(
                  (s, i, self) =>
                    self.findIndex((x) => x.charAt(0) === s.charAt(0)) === i,
                ),
            },
          };
        }
        if (
          searchQueryEqual(
            convertToCourseOnly(course),
            convertToCourseOnly(query),
          ) &&
          typeof course.sectionNumbers !== 'undefined'
        ) {
          if (sectionCanOverlap(section))
            return {
              ...entry,
              query: {
                ...course,
                sectionNumbers: course.sectionNumbers.filter(
                  (sec, i, self) =>
                    self.findIndex((s) => s.charAt(0) === sec.charAt(0)) === i,
                ),
              },
            };
          return {
            ...entry,
            query: {
              ...course,
              sectionNumbers: course.sectionNumbers.filter((s) =>
                sectionCanOverlap(s),
              ),
            },
          };
        }
        return entry;
      });
    });
  }

  const plannerColorMap = Object.fromEntries(
    removeDuplicates(planner.map((e) => convertToCourseOnly(e.query))).map(
      (key, index) => [
        searchQueryLabel(key),
        plannerColors[index % plannerColors.length],
      ],
    ),
  );

  const [courseNames, setCourseNames] = useState<{
    [key: string]: string | undefined;
  }>({});

  return (
    <SharedStateContext.Provider
      value={{
        compare,
        addToCompare,
        removeFromCompare,
        compareColorMap,
        planner,
        addToPlanner,
        removeFromPlanner,
        setPlannerSection,
        plannerColorMap,
        courseNames,
        setCourseNames,
        availableSemesters,
        teachingSemester,
        setTeachingSemester,
        effectiveTeachingSemester,
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
