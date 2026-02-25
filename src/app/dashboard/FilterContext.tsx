'use client';

import {
  getSectionTypesFromSearchResults,
  getSemestersFromSearchResults,
} from '@/modules/semesters';
import type { SearchResult } from '@/types/SearchQuery';
import {
  createContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useSharedState } from '../SharedStateProvider';

export const FiltersContext = createContext<{
  chosenSemesters: string[];
  setChosenSemesters: Dispatch<SetStateAction<string[]>>;
  semesters: string[];
  sectionTypes: string[];
  chosenSectionTypes: string[];
  setChosenSectionTypes: Dispatch<SetStateAction<string[]>>;
  sectionTypesOverride: string[];
  chosenSectionTypesOverride: string;
  setChosenSectionTypesOverride: Dispatch<SetStateAction<string>>;
}>({
  semesters: [],
  chosenSemesters: [],
  setChosenSemesters: (_) => _,
  sectionTypes: [],
  chosenSectionTypes: [],
  setChosenSectionTypes: (_) => _,
  sectionTypesOverride: [],
  chosenSectionTypesOverride: '',
  setChosenSectionTypesOverride: (_) => _,
});

export default function FiltersProvider({
  searchResults,
  children,
}: {
  searchResults: SearchResult[];
  children: ReactNode;
}) {
  const { compare } = useSharedState();
  const semesters = useMemo(() => {
    return getSemestersFromSearchResults(searchResults.concat(compare));
  }, [searchResults, compare]);
  const [chosenSemesters, setChosenSemesters] = useState<string[]>(
    getSemestersFromSearchResults(searchResults),
  );

  const sectionTypes = useMemo(() => {
    return getSectionTypesFromSearchResults(searchResults.concat(compare));
  }, [searchResults, compare]);
  const [chosenSectionTypes, setChosenSectionTypes] = useState<string[]>(
    getSectionTypesFromSearchResults(searchResults),
  );

  const sectionTypesOverride = ['all', 'in-person', 'online', 'hybrid'];
  const [chosenSectionTypesOverride, setChosenSectionTypesOverride] =
    useState<string>(() => {
      return sectionTypesOverride[0];
    });

  const [prevSearchResults, setPrevSearchResults] =
    useState<SearchResult[]>(searchResults);
  if (searchResults != prevSearchResults) {
    setPrevSearchResults(searchResults);
    setChosenSemesters(
      getSemestersFromSearchResults(searchResults.concat(compare)),
    );
    setChosenSectionTypes(
      getSectionTypesFromSearchResults(searchResults.concat(compare)),
    );
  }

  return (
    <FiltersContext.Provider
      value={{
        chosenSemesters,
        setChosenSemesters,
        semesters,
        chosenSectionTypes,
        setChosenSectionTypes,
        sectionTypes,
        sectionTypesOverride,
        chosenSectionTypesOverride,
        setChosenSectionTypesOverride,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
