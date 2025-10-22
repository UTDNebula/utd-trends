'use client';
import { getSemestersFromSearchResults } from '@/modules/semesters';
import type { SearchResult } from '@/types/SearchQuery';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useMemo,
  useState,
} from 'react';
import { useSharedState } from '../SharedStateProvider';

export const FiltersContext = createContext<{
  chosenSemesters: string[];
  setChosenSemesters: Dispatch<SetStateAction<string[]>>;
  semesters: string[];
}>({ semesters: [], chosenSemesters: [], setChosenSemesters: (_) => _ });

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
  const [prevSearchResults, setPrevSearchResults] =
    useState<SearchResult[]>(searchResults);
  if (searchResults != prevSearchResults) {
    setPrevSearchResults(searchResults);
    setChosenSemesters(
      getSemestersFromSearchResults(searchResults.concat(compare)),
    );
  }

  return (
    <FiltersContext.Provider
      value={{ chosenSemesters, setChosenSemesters, semesters }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
