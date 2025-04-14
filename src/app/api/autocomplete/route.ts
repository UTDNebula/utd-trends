import { NextResponse } from 'next/server';

import autocompleteGraph from '@/data/autocomplete_graph.json';
import { getGraph, searchAutocomplete } from '@/modules/autocomplete';
import { type SearchQuery } from '@/types/SearchQuery';

const graph = getGraph(autocompleteGraph as object);

type Data = {
  message: string;
  data?: SearchQuery[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  if (typeof input !== 'string') {
    return NextResponse.json(
      { message: 'Incorrect query parameters' },
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

  return NextResponse.json(
    {
      message: 'success',
      data: results,
    } satisfies Data,
    { status: 200 },
  );
}
