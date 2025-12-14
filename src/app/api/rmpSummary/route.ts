import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fetchRmp from '@/modules/fetchRmp';
import type { SearchQuery } from '@/types/SearchQuery';

export async function GET(request: Request) {
  const API_URL = process.env.NEBULA_API_URL;
  if (typeof API_URL !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API URL is undefined' },
      { status: 500 },
    );
  }
  const API_KEY = process.env.NEBULA_API_KEY;
  if (typeof API_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API key is undefined' },
      { status: 500 },
    );
  }
  const API_STORAGE_BUCKET = process.env.NEBULA_API_STORAGE_BUCKET;
  if (typeof API_STORAGE_BUCKET !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API storage bucket is undefined' },
      { status: 500 },
    );
  }
  const API_STORAGE_KEY = process.env.NEBULA_API_STORAGE_KEY;
  if (typeof API_STORAGE_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API storage key is undefined' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const profFirst = searchParams.get('profFirst');
  const profLast = searchParams.get('profLast');
  if (typeof profFirst !== 'string' || typeof profLast !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  // Check cache
  const filename = profFirst + profLast + '.txt';
  const url = API_URL + 'storage/' + API_STORAGE_BUCKET + '/' + filename;
  const headers = {
    'x-api-key': API_KEY,
    'x-storage-key': API_STORAGE_KEY,
  };
  const cache = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (cache.ok) {
    const cacheData = await cache.json();
    // Cache is valid for 30 days
    if (
      new Date(cacheData.data.updated) >
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    ) {
      const mediaData = await fetch(cacheData.data.media_link, { headers });
      if (mediaData.ok) {
        return NextResponse.json(
          { message: 'success', data: await mediaData.text() },
          { status: 200 },
        );
      }
    }
  }

  // Fetch RMP
  const searchQuery: SearchQuery = {
    profFirst: profFirst,
    profLast: profLast,
  };
  const rmp = await fetchRmp(searchQuery, true);

  if (!rmp?.ratings) {
    return NextResponse.json(
      { message: 'error', data: 'No ratings found' },
      { status: 500 },
    );
  }
  if (rmp.ratings.edges.length < 5) {
    return NextResponse.json(
      { message: 'error', data: 'Not enough ratings for a summary' },
      { status: 500 },
    );
  }

  // AI
  const prompt = `Summarize the Rate My Professors reviews of professor ${profFirst} ${profLast}:

${rmp.ratings.edges.map((rating) => rating.node.comment.replaceAll('\n', ' ').slice(0, 500)).join('\n')}

Summary requirements:
- Summarize the reviews in a concise and informative manner, synthesizing the most important and relevant information.
- Be respectful but honest.
- Respond in plain-text (no markdown), with no more than 100 words.
`;
  const GEMINI_SERVICE_ACCOUNT = process.env.GEMINI_SERVICE_ACCOUNT;
  if (typeof GEMINI_SERVICE_ACCOUNT !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'GEMINI_SERVICE_ACCOUNT is undefined' },
      { status: 500 },
    );
  }
  const serviceAccount = JSON.parse(GEMINI_SERVICE_ACCOUNT);
  const geminiClient = new GoogleGenAI({
    vertexai: true,
    project: serviceAccount.project_id,
    googleAuthOptions: {
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      },
    },
  });
  const response = await geminiClient.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  // Cache response
  const cacheResponse = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: response.text,
  });

  if (!cacheResponse.ok) {
    return NextResponse.json(
      { message: 'error', data: 'Failed to cache response' },
      { status: 500 },
    );
  }

  // Return
  return NextResponse.json(
    { message: 'success', data: response.text },
    { status: 200 },
  );
}
