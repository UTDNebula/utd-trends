'use client';
import { getSemestersFromSearchResults } from '@/modules/semesters';
import type { SearchResult } from '@/types/SearchQuery';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from 'react';

export const FiltersContext = createContext<{
  chosenSemesters: string[];
  setChosenSemesters: Dispatch<SetStateAction<string[]>>;
}>({ chosenSemesters: [], setChosenSemesters: (_) => _ });

export default function FiltersProvider({
  searchResults,
  children,
}: {
  searchResults: SearchResult[];
  children: ReactNode;
}) {
  const [chosenSemesters, setChosenSemesters] = useState<string[]>(
    getSemestersFromSearchResults(searchResults),
  );
  const [prevSearchResults, setPrevSearchResults] =
    useState<SearchResult[]>(searchResults);
  if (searchResults != prevSearchResults) {
    setPrevSearchResults(searchResults);
    setChosenSemesters(getSemestersFromSearchResults(searchResults));
  }

  return (
    <FiltersContext.Provider value={{ chosenSemesters, setChosenSemesters }}>
      {children}
    </FiltersContext.Provider>
  );
}
