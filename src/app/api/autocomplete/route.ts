import autocompleteGraph from '@/data/autocomplete_graph.json';
import { getGraph, searchAutocomplete } from '@/modules/autocomplete';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';
import { NextResponse } from 'next/server';

const graph = getGraph(autocompleteGraph as object);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  if (typeof input !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  let searchBy: 'any' | 'professor' | 'course' = 'any';
  const searchByParam = searchParams.get('searchBy');
  if (searchByParam === 'professor' || searchByParam === 'course') {
    searchBy = searchByParam;
  }

  let limit = 20;
  const limitParam = searchParams.get('limit');
  if (typeof limitParam === 'string' && !isNaN(Number(limitParam))) {
    limit = Number(limitParam);
  }

  const results = searchAutocomplete(graph, input, limit, searchBy);

  results.sort((a, b) => {
    const aIsCourse = 'prefix' in a;
    const bIsCourse = 'prefix' in b;

    // making sure that courses always come before professors
    if (aIsCourse !== bIsCourse) {
      if (aIsCourse) {
        return -1;
      }
      return 1;
    }

    // sorts results in descending order, while putting any results with 0 students at the end
    return (b.totalStudents ?? -1) - (a.totalStudents ?? -1);
  });

  return NextResponse.json(
    {
      message: 'success',
      data: results,
    } satisfies GenericFetchedData<SearchQuery[]>,
    { status: 200 },
  );
}
