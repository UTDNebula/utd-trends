'use client';

import Compare from '@/components/compare/Compare/Compare';
import Header from '@/components/navigation/Header/Header';
import { getSemestersFromSearchResults } from '@/modules/semesters';
import type { SearchResult } from '@/types/SearchQuery';
import { Card } from '@mui/material';
import { useSearchParams } from 'next/navigation';
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
}>({ semesters: [], chosenSemesters: [], setChosenSemesters: (_) => _ });

export default function FiltersProvider({
  searchResults,
  children,
}: {
  searchResults: SearchResult[];
  children: ReactNode;
}) {
  const { compare } = useSharedState();
  const params = useSearchParams();
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
      {params.get('compare') === 'true' ? (
        <>
          <Header isPlanner={true} />
          <main className="p-4 overflow-y-auto">
            <Card className="w-full p-4">
              <Compare />
            </Card>
          </main>
        </>
      ) : (
        children
      )}
    </FiltersContext.Provider>
  );
}
