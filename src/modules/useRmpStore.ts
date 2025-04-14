import { useState } from 'react';

import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery, searchQueryLabel } from '@/types/SearchQuery';

//Fetch RMP data from RMP
function fetchRmpData(
  professor: SearchQuery,
  controller: AbortController,
): Promise<RMPInterface> {
  return fetch(
    '/api/ratemyprofessorScraper?profFirst=' +
      encodeURIComponent(String(professor.profFirst)) +
      '&profLast=' +
      encodeURIComponent(String(professor.profLast)),
    {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.message !== 'success') {
        throw new Error(response.message);
      }
      return response.data;
    });
}

//Limit cached number of grades and rmp data entries
const MAX_ENTRIES = 1000;

interface RMP {
  [key: string]: GenericFetchedData<RMPInterface>;
}

export default function useRmpStore(): [
  RMP,
  (arg0: RMP | ((arg0: RMP) => RMP)) => void,
  (course: SearchQuery, controller: AbortController) => void,
] {
  const [rmp, setRmp] = useState<RMP>({});

  function addToRmp(key: string, value: GenericFetchedData<RMPInterface>) {
    setRmp((old) => {
      const newVal = { ...old };
      if (typeof newVal[key] !== 'undefined') {
        newVal[key] = value;
        return newVal;
      }
      if (Object.keys(newVal).length >= MAX_ENTRIES) {
        // Remove the oldest entry
        const oldestKey = Object.keys(newVal)[0];
        delete newVal[oldestKey];
      }
      newVal[key] = value;
      return newVal;
    });
  }

  //Call fetchRmpData and store response
  function fetchAndStoreRmpData(
    professor: SearchQuery,
    controller: AbortController,
  ) {
    const entry = rmp[searchQueryLabel(professor)];
    if (typeof entry !== 'undefined' && entry.state !== 'error') {
      return;
    }
    addToRmp(searchQueryLabel(professor), { state: 'loading' });
    fetchRmpData(professor, controller)
      .then((res: RMPInterface) => {
        //Add to storage
        //Set loading status to done
        addToRmp(searchQueryLabel(professor), {
          state: typeof res !== 'undefined' ? 'done' : 'error',
          data: res,
        });
      })
      .catch(() => {
        //Set loading status to error
        addToRmp(searchQueryLabel(professor), { state: 'error' });
      });
  }

  return [rmp, setRmp, fetchAndStoreRmpData];
}
