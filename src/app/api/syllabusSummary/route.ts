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
  const syllabus_uri = searchParams.get('syllabus_uri');
  if (typeof syllabus_uri !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  //   // Check cache
  //   const filename = syllabus_uri + '.txt';
  //   const url = API_URL + 'storage/' + API_STORAGE_BUCKET + '/' + filename;
  //   const headers = {
  //     'x-api-key': API_KEY,
  //     'x-storage-key': API_STORAGE_KEY,
  //   };
  //   const cache = await fetch(url, { headers });
  //   if (cache.ok) {
  //     const cacheData = await cache.json();
  //     // Cache is valid for 30 days
  //     if (
  //       new Date(cacheData.data.updated) >
  //       new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  //     ) {
  //       const mediaData = await fetch(cacheData.data.media_link); //TODO: what is media_link?
  //       if (mediaData.ok) {
  //         return NextResponse.json(
  //           { message: 'success', data: await mediaData.text() },
  //           { status: 200 },
  //         );
  //       }
  //     }
  //   }

  // Fetch Syllabus from URI
  const syllabus = await fetch(syllabus_uri);

  if (!syllabus.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch Syllabus from URI' },
      { status: 500 },
    );
  }

  const arrayBuffer = await syllabus.arrayBuffer();
  const pdfBase64 = Buffer.from(arrayBuffer).toString('base64');

  // AI
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
            text:
            // Original - 'Extract the grading weights and grade scale exactly as shown in the tables. Provide a concise summary of the course structure & professor style for students.',

               /* `  POLISHED VERSION THE ORIGINAL
            Extract the grading weights and grade scale exactly as shown in the tables.

                      Then write a concise, student-focused summary only in bullet points, and not a paragraph that helps a student decide 
                      whether this professor is a good fit for them.

                      Focus on:
                      - workload intensity (exam-heavy vs assignment-heavy)
                      - number and type of exams(comprehensive or not, mcqs or subjective etc)
                      - group vs individual work
                      - strictness on deadlines and academic policies
                      - teaching style (theoretical vs practical, lecture-heavy vs interactive)
                      

                      Avoid course topic descriptions unless they affect workload or difficulty.
                      Be direct and practical.
                      No need to write about academic honesty policies
                      Keep the word limit to around 30-40 words
                    `, */
                    
            /*  `  RATE MY PROFF STYLE
                      Extract the grading weights and grade scale exactly as shown in the tables.

                      Then write a short, student-style summary that sounds like a realistic
                      RateMyProfessor review.

                      Focus on:
                      - how heavy the workload feels
                      - how frequent the exams are, and how stressful they can be based on their weightage 
                      - whether group work is common or avoidable
                      - how strict deadlines feel in practice
                      

                      Use casual, plain language.
                      Avoid formal or academic wording.
                      Do not use bullets or headings.
                      No need to talk about Grading scale, until its not standard
                      Write 2-3 natural sentences (30-40 words).
                  `, */
            
            
            
            /*`   (SNAPSHOT VERSION - NEEDS TO BE PROPERLY FORMATTED!)
            Extract the grading weights and grade scale exactly as shown in the tables. 
                      Write a concise   student-focused summary " Snapshot" using 4-5 labeled lines that helps a student decide 
                      whether this professor is a good fit for them.

                      Focus on:
                      - workload intensity (exam-heavy vs assignment-heavy)
                      - number and type of exams(comprehensive or not, mcqs or subjective etc)
                      - group vs individual work
                      - strictness on deadlines and academic policies
                      - teaching style (theoretical vs practical, lecture-heavy vs interactive)
                      

                      Avoid course topic descriptions unless they affect workload or difficulty.
                      Be direct and practical.
                      No need to write about academic honesty policies or make up exam policies
                      Each line must follow the format:
                      Label: short description
                      Do NOT use paragraphs or bullet points. 

            
            `*/

            
            /* `  (BULLET POINTS - NEED TO BE FORMATTED PROPERLY)
            Extract the grading weights and grade scale exactly as shown in the tables.

                      Then write a concise, student-focused summary only in bullet points, and not a paragraph that helps a student decide 
                      whether this professor is a good fit for them.

                      Focus on:
                      - workload intensity (exam-heavy vs assignment-heavy)
                      - number and type of exams(comprehensive or not, mcqs or subjective etc)
                      - group vs individual work
                      - strictness on deadlines and academic policies
                      - teaching style (theoretical vs practical, lecture-heavy vs interactive)
                      

                      Avoid course topic descriptions unless they affect workload or difficulty.
                      Be direct and practical.
                      No need to write about academic honesty policies
                      Keep the word limit to around 30-40 words
                    `, */
          },
        ],
      },
    ],
  });

  //   // Cache response
  //   const cacheResponse = await fetch(url, {
  //     method: 'POST',
  //     headers: headers,
  //     body: response.text,
  //   });

  //   if (!cacheResponse.ok) {
  //     return NextResponse.json(
  //       { message: 'error', data: 'Failed to cache response' },
  //       { status: 500 },
  //     );
  //   }
  const responseData = JSON.parse(response.text ?? '');
  // Return
  return NextResponse.json(
    { message: 'success', data: responseData },
    { status: 200 },
  );
}
