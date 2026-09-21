/*
Fetch the aggregated data from the API
*/
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../.env.local') });
config({ path: resolve(__dirname, '../../.env') });

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

  const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
  fetch(`${baseUrl}autocomplete/dag`, {
    method: 'GET',
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => {
      writeFileSync('src/data/aggregated_data.json', JSON.stringify(data));

      console.log('Aggregated data fetched.');
    });
}
