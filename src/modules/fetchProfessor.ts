import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

export interface Professor {
  _id: string;
  email: string;
  first_name: string;
  image_uri: string;
  last_name: string;
  office: {
    building: string;
    room: string;
    map_uri: string;
  };
  //office_hours: any[];
  phone_number: string;
  profile_uri: string;
  sections: string[];
  titles: string[];
}

export default async function fetchProfessor(
  query: SearchQuery,
): Promise<GenericFetchedData<Professor>> {
  const API_KEY = process.env.REACT_APP_NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return { message: 'error', data: 'API key is undefined' };
  }

  try {
    const url = new URL('https://api.utdnebula.com/professor');
    if (
      typeof query.profFirst === 'string' &&
      typeof query.profLast === 'string'
    ) {
      url.searchParams.append('first_name', query.profFirst);
      url.searchParams.append('last_name', query.profLast);
    } else {
      throw new Error('Incorrect query present');
    }
    const res = await fetch(url.href, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    const data = await res.json();

    if (data.message !== 'success') {
      throw new Error(data.message);
    }

    return {
      message: 'success',
      data: data.data[0],
    };
  } catch (error) {
    return {
      message: 'error',
      data:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
