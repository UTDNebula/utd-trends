import { useState } from 'react';

import fetchWithCache, {
  cacheIndexNebula,
  expireTime,
} from '@/modules/fetchWithCache/fetchWithCache';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { SectionData } from '@/pages/api/sections';

//Fetch section data from nebula api
function fetchSectionsData(
  query: SearchQuery,
  controller: AbortController,
): Promise<SectionData> {
  return fetchWithCache(
    '/api/sections?' +
      Object.keys(query)
        .map(
          (key) =>
            key +
            '=' +
            encodeURIComponent(String(query[key as keyof SearchQuery])),
        )
        .join('&'),
    cacheIndexNebula,
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

//Limit cached number of data entries
const MAX_ENTRIES = 1000;

interface Sections {
  [key: string]: GenericFetchedData<SectionData>;
}

export default function useSectionsStore(): [
  Sections,
  (arg0: Sections | ((arg0: Sections) => Sections)) => void,
  (combo: SearchQuery, controller: AbortController) => void,
] {
  const [sections, setSections] = useState<Sections>({});

  function addToSections(key: string, value: GenericFetchedData<SectionData>) {
    setSections((old) => {
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

  //Call fetchSectionsData and store response
  function fetchAndStoreSectionsData(
    combo: SearchQuery,
    controller: AbortController,
  ) {
    addToSections(searchQueryLabel(combo), { state: 'loading' });
    const seperatedCombo = [
      convertToCourseOnly(combo),
      convertToProfOnly(combo),
    ]
      //Remove empty objects (for non combos)
      .filter((obj) => Object.keys(obj).length !== 0);
    Promise.all(
      seperatedCombo.map((query) => fetchSectionsData(query, controller)),
    )
      .then((res: SectionData[]) => {
        //Find intersection of all course sections and all professor sections
        let intersection: SectionData = [];
        if (res.length === 1) {
          intersection = res[0];
        } else if (res.length === 2) {
          intersection = res[0].filter(
            (value) => res[1].findIndex((val) => val._id === value._id) !== -1,
          );
        }
        //Add to storage
        //Set loading status to done
        addToSections(searchQueryLabel(combo), {
          state: 'done',
          data: intersection,
        });
      })
      .catch(() => {
        //Set loading status to error
        addToSections(searchQueryLabel(combo), { state: 'error' });
      });
  }

  return [sections, setSections, fetchAndStoreSectionsData];
}
