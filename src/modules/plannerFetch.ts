'use client';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  isCourseQuery,
  isProfessorQuery,
  removeSection,
  searchQueryLabel,
  type SearchQuery,
  type SearchResult,
} from '@/types/SearchQuery';
import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GradesData } from './fetchGrades';

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

function mergeHooks(
  sectionHook: UseQueryResult<SearchResult, Error>,
  rmpHook: UseQueryResult<SearchResult, Error>,
  query: SearchQuery,
) {
  return sectionHook.data && rmpHook.data
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
        courseName:
          sectionHook.data.type == 'course' && sectionHook.data.courseName,
      }
    : undefined;
}

export function useSearchResult(query: SearchQuery) {
  let sectionHook = useQuery({
    queryKey: [
      'results',
      searchQueryLabel(convertToCourseOnly(removeSection(query))),
    ],
    queryFn: async () => {
      const data = await fetchSearchResult(convertToCourseOnly(query));
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
  const rmpHook = useQuery({
    queryKey: [
      'rmp',
      searchQueryLabel(convertToProfOnly(removeSection(query))),
    ],
    queryFn: async () => {
      const data = await fetchSearchResult(
        convertToProfOnly(removeSection(query)),
      );
      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: isProfessorQuery(query), // only fetch if query is a Professor type as well
  });
  if (sectionHook.data) {
    sectionHook = {
      ...sectionHook,
      data: {
        ...sectionHook.data,
        grades: sectionHook.data?.sections
          .filter(
            (section) =>
              (query.profFirst == null && query.profLast == null) ||
              section.professor_details?.find(
                (p) =>
                  p.first_name == query.profFirst &&
                  p.last_name == query.profLast,
              ),
          ) // filter to the professor (or overall)
          .map((section) => ({
            // convert to GradesData form
            _id: section.academic_session.name,
            data: [
              {
                type: 'all',
                grade_distribution: section.grade_distribution,
              },
            ],
          }))
          .reduce((acc, curr) => {
            // group by semester _id
            const existing = acc.find((item) => item._id === curr._id);

            if (existing) {
              existing.data.map((e) => {
                e.grade_distribution.map((val, idx) => {
                  const currVal = curr.data[0].grade_distribution[idx];
                  // check for valid numbers otheriwise it NaN'd
                  return typeof val === 'number' && typeof currVal === 'number'
                    ? val + currVal
                    : val;
                });
              });
            } else {
              acc.push({ ...curr });
            }

            return acc;
          }, [] as GradesData)
          .filter((d) => d.data.every((s) => s.grade_distribution.length != 0)), // knock out the semesters with no disributions (like perhaps the upcoming one)
      },
    };
  }
  const combinedHook = useMemo(() => {
    if (isCourseQuery(query) && isProfessorQuery(query)) {
      const isLoading = sectionHook.isLoading || rmpHook.isLoading;
      const isError = sectionHook.isError || rmpHook.isError;

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
          const [sectionResult, rmpResult] = await Promise.all([
            sectionHook.refetch(),
            rmpHook.refetch(),
          ]);
          return {
            ...sectionResult,
            data: mergeHooks(sectionResult, rmpResult, query),
          };
        },
      } as UseQueryResult<SearchResult, Error>;
    }
    return null;
  }, [sectionHook, rmpHook, query]);
  if (isProfessorQuery(query)) {
    if (isCourseQuery(query)) {
      return combinedHook!; // combo -- know this is non-null as query is both a prof and course query
    }
    return rmpHook; // professor only
  }
  return sectionHook; // course only
}

export function useSearchresults(queries: SearchQuery[]) {
  const queriesHook = useQueries({
    queries: queries.map((q) => {
      return {
        queryKey: [
          'results',
          searchQueryLabel(convertToCourseOnly(removeSection(q))),
        ],
        queryFn: async () => {
          return await fetchSearchResult(q);
        },
        staleTime: 1000 * 60 * 60,
      };
    }),
  });
  return queriesHook;
}
