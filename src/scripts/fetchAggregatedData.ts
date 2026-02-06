/*
Fetch the aggregated data from the API
*/
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

const envPath = resolve(__dirname, '../../.env.local');
config({ path: envPath });

const API_URL = process.env.NEBULA_API_URL;
const API_KEY = process.env.NEBULA_API_KEY;
if (typeof API_URL !== 'string') {
  console.error('API URL is undefined');
} else if (typeof API_KEY !== 'string') {
  console.error('API key is undefined');
} else {
  const headers = {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  };

  fetch(API_URL + 'autocomplete/dag', {
    method: 'GET',
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      writeFileSync('src/data/aggregated_data.json', JSON.stringify(data));

      console.log('Aggregated data fetched.');
    });
}
