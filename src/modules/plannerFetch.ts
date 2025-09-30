'use client';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  searchQueryLabel,
  type SearchQuery,
  type SearchResult,
} from '@/types/SearchQuery';
import { useQuery } from '@tanstack/react-query';

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

export function useSearchResult(query: SearchQuery) {
  const queryHook = useQuery({
    queryKey: ['results', searchQueryLabel(query)],
    queryFn: async () => {
      const data = await fetchSearchResult(query);
      return data;
    },
  });
  return queryHook;
}
