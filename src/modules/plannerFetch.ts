'use client';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  isCourseQuery,
  isProfessorQuery,
  removeSection,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
  type SearchResult,
} from '@/types/SearchQuery';
import { useQueries, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

async function fetchSearchResult(query: SearchQuery) {
  const params = new URLSearchParams();
  if (query.prefix) params.append('prefix', query.prefix);
  if (query.number) params.append('number', query.number);
  if (query.profFirst) params.append('profFirst', query.profFirst);
  if (query.profLast) params.append('profLast', query.profLast);
  const res = await fetch(`/api/planner?${params.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) {
    throw new Error('request failed');
  }
  const body = (await res.json()) as GenericFetchedData<SearchResult>;
  if (body.message === 'success') {
    return body.data;
  }
  throw new Error(body.data);
}

function mergeHooks(sectionHook : UseQueryResult<SearchResult, Error>, rmpHook : UseQueryResult<SearchResult, Error>, query : SearchQuery)
{
  return (sectionHook.data && rmpHook.data)
          ? {
              type: 'combo',
              grades: sectionHook.data.grades,
              RMP: rmpHook.data.type == 'professor' && rmpHook.data.RMP,
              searchQuery: {
                prefix: query.prefix,
                number: query.number,
                profFirst: query.profFirst,
                profLast: query.profLast,
                sectionNumber: query.sectionNumber,
              },
              sections: sectionHook.data.sections,
              courseName: sectionHook.data.type == 'course' && sectionHook.data.courseName,
          }
          : undefined;
}

export function useSearchResult(query: SearchQuery) {
  const sectionHook = useQuery({
    queryKey: ['results', searchQueryLabel(convertToCourseOnly(removeSection(query)))],
    queryFn: async () => {
      const data = await fetchSearchResult(convertToCourseOnly(query));
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
  
  if (isProfessorQuery(query)) {
    const rmpHook = useQuery({
      queryKey: ['rmp', searchQueryLabel(convertToProfOnly(removeSection(query)))],
      queryFn: async () => {
        const data = await fetchSearchResult(convertToProfOnly(removeSection(query)));
        return data;
      },
      staleTime: 1000 * 60 * 60,
    });
    
    if (isCourseQuery(query))
    {
      const combinedHook = useMemo(() => {
        const isLoading = sectionHook.isLoading || rmpHook.isLoading;
        const isError = sectionHook.isError || rmpHook.isError;
        const error = sectionHook.error || rmpHook.error;
        
        // Merge data from both queries
        const data = mergeHooks(sectionHook, rmpHook, query);

        return {
          ...sectionHook,
          data: data,
          isLoading: sectionHook.isLoading || rmpHook.isLoading,
          isPending: sectionHook.isPending || rmpHook.isPending,
          isError: sectionHook.isError || rmpHook.isError,
          error: sectionHook.error || rmpHook.error,
          isSuccess: sectionHook.isSuccess && rmpHook.isSuccess,
          status: isLoading ? 'loading' : isError ? 'error' : 'success',
          refetch: async () => {
            const [sectionResult, rmpResult] = await Promise.all([sectionHook.refetch(), rmpHook.refetch()]);
            return {...sectionResult, data: mergeHooks(sectionResult, rmpResult, query)};
          },  
        } as UseQueryResult<SearchResult, Error>;
      }, [sectionHook, rmpHook]);

      return combinedHook;
    }
    return rmpHook;
  }
  return sectionHook;
}

export function useSearchresults(queries: SearchQuery[]) {
  const queriesHook = useQueries({
    queries: queries.map((q) => {
      return {
        queryKey: ['results', searchQueryLabel(convertToCourseOnly(removeSection(q)))],
        queryFn: async () => {
          return await fetchSearchResult(q);
        },
        staleTime: 1000 * 60 * 60,
      };
    }),
  });
  return queriesHook;
}
