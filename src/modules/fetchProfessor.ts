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
): Promise<Professor> {
  const API_URL = process.env.NEBULA_API_URL;
  if (typeof API_URL !== 'string') {
    throw new Error('API URL is undefined');
  }
  const API_KEY = process.env.NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    throw new Error('API key is undefined');
  }

  try {
    const url = new URL(API_URL + 'professor');
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
      throw new Error(data.data ?? data.message);
    }

    return data.data[0];
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
}
