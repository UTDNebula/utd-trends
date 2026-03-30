import crypto from 'crypto'; // <-- Added for hashing
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const syllabusResponseSchema = {
  type: 'OBJECT',
  properties: {
    summary: {
      type: 'STRING',
      description:
        'A direct, no-fluff summary of the course structure & professor style.',
    },
    grade_weights: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          category: {
            type: 'STRING',
            description: 'e.g., Attendance, Midterm',
          },
          percentage: { type: 'STRING', description: 'e.g., 5%, 20%' },
        },
      },
    },
    letter_grade_scale: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          grade: { type: 'STRING', description: 'e.g., A, B' },
          range: { type: 'STRING', description: 'e.g., 90-100, 80-89.9' },
        },
      },
    },
  },
  required: ['summary', 'grade_weights', 'letter_grade_scale'],
};

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
  const API_SYLLABUS_STORAGE_BUCKET =
    process.env.NEBULA_API_SYLLABUS_STORAGE_BUCKET;
  if (typeof API_SYLLABUS_STORAGE_BUCKET !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API Syllabus storage bucket is undefined' },
      { status: 500 },
    );
  }
  const API_STORAGE_KEY = process.env.NEBULA_API_STORAGE_KEY;
  if (typeof API_STORAGE_KEY !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'API Syllabus storage key is undefined' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const syllabus_uri = searchParams.get('syllabus_uri');
  if (typeof syllabus_uri !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  // Fetch Syllabus from URI
  const syllabus = await fetch(syllabus_uri);

  if (!syllabus.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch Syllabus from URI' },
      { status: 500 },
    );
  }

  const arrayBuffer = await syllabus.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // generate hash
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  const filename = fileHash + '.txt';

  // check cache
  const url =
    API_URL + 'storage/' + API_SYLLABUS_STORAGE_BUCKET + '/' + filename;
  const headers = {
    'x-api-key': API_KEY,
    'x-storage-key': API_STORAGE_KEY,
  };

  const cache = await fetch(url, { headers });
  if (cache.ok) {
    const cacheData = await cache.json();

    const mediaData = await fetch(cacheData.data.public_url);
    if (mediaData.ok) {
      const cachedText = await mediaData.text();

      return NextResponse.json(
        { message: 'success', data: JSON.parse(cachedText) },
        { status: 200 },
      );
    }
  }

  // LLM (if not in cache)
  const pdfBase64 = buffer.toString('base64');

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
    config: {
      responseMimeType: 'application/json',
      responseSchema: syllabusResponseSchema,
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfBase64,
            },
          },

          {
            // prettier-ignore
            text:
` Extract the grading weights and grade scale exactly as shown in the tables.

  Then write a concise, student-focused summary that helps a student decide 
  whether this professor is a good fit.

  Important:
  - Do NOT repeat exact grading percentages or numeric figures.
  - Instead, describe the grading structure generally (e.g., exam-heavy, project-heavy, balanced).
  - Mention late work policies, attendance requirements, grading curves, or flexibility ONLY if they are explicitly stated in the syllabus.
  - If something is not mentioned, do NOT assume or include it.

  Focus on:
  - overall workload feel
  - number and type of exams (comprehensive, MCQ, subjective, etc.)
  - group vs individual work
  - strictness of deadlines (if stated)
  - teaching style (theoretical vs practical, lecture-heavy vs interactive)

  Avoid course topic descriptions unless they affect workload or difficulty.
  Be direct and practical.
  Do not mention academic honesty policies.
  Write 2–3 natural sentences, around 30–40 words. `,
          },
        ],
      },
    ],
  });

  // cache LLM response
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
  const responseData = JSON.parse(response.text ?? '{}');

  // Return
  return NextResponse.json(
    { message: 'success', data: responseData },
    { status: 200 },
  );
}
