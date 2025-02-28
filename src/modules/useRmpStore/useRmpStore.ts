import { useState } from 'react';

import fetchWithCache, {
  cacheIndexRmp,
  expireTime,
} from '@/modules/fetchWithCache/fetchWithCache';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import {
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';

//Fetch RMP data from RMP
function fetchRmpData(
  professor: SearchQuery,
  controller: AbortController,
): Promise<RMPInterface> {
  return fetchWithCache(
    '/api/ratemyprofessorScraper?profFirst=' +
      encodeURIComponent(String(professor.profFirst)) +
      '&profLast=' +
      encodeURIComponent(String(professor.profLast)),
    cacheIndexRmp,
    expireTime,
    {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  ).then((response) => {
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
      .catch((error) => {
        //Set loading status to error
        addToRmp(searchQueryLabel(professor), { state: 'error' });
        if (!(error instanceof DOMException && error.name == 'AbortError')) {
          console.error('RMP data for ' + searchQueryLabel(professor), error);
        }
      });
  }

  return [rmp, setRmp, fetchAndStoreRmpData];
}
