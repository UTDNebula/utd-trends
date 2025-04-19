import { useEffect, useRef, useState } from 'react';

import { compareSemesters } from '@/modules/semesters';
import type { SectionsData } from '@/pages/api/sections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import {
  convertToCourseOnly,
  convertToProfOnly,
  type SearchQuery,
  searchQueryLabel,
} from '@/types/SearchQuery';
import type { SectionsType } from '@/types/SectionsType';

interface CachedSectionRequests {
  [key: string]: Promise<SectionsData>;
}
export const SectionRequestCache: CachedSectionRequests = {}

//Fetch section data from nebula api
function fetchSectionsData(
  query: SearchQuery,
  controller: AbortController,
): Promise<SectionsData> {
  const queryLabel = searchQueryLabel(query);
  const cachedSectionRequest = SectionRequestCache[queryLabel];
  if (typeof cachedSectionRequest !== 'undefined')
    return cachedSectionRequest;
  
  SectionRequestCache[queryLabel] = fetch(
    '/api/sections?' +
      Object.keys(query)
        .map(
          (key) =>
            key +
            '=' +
            encodeURIComponent(String(query[key as keyof SearchQuery])),
        )
        .join('&'),
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

    return SectionRequestCache[queryLabel];
}

// Finding the most recent semester in the database by the newest GOVT 2306 semester (don't judge me)
function checkLatestSemester() {
  return fetchSectionsData(
    { prefix: 'GOVT', number: '2306' },
    new AbortController(),
  ).then((res: SectionsData) => {
    return (
      res
        //exclude summers
        .filter((sem) => !sem.academic_session.name.includes('U'))
        .sort((a, b) =>
          compareSemesters(b.academic_session.name, a.academic_session.name),
        )[0].academic_session.name
    );
  });
}

//Limit cached number of data entries
const MAX_ENTRIES = 1000;

interface Sections {
  [key: string]: GenericFetchedData<SectionsType>;
}

export default function useSectionsStore(): [
  Sections,
  (arg0: Sections | ((arg0: Sections) => Sections)) => void,
  (combo: SearchQuery, controller: AbortController) => void,
] {
  const [sections, setSections] = useState<Sections>({});
  const latestSemester = useRef('');
  useEffect(() => {
    checkLatestSemester().then((result: string) => {
      latestSemester.current = result;
    });
  }, []);

  function addToSections(key: string, value: GenericFetchedData<SectionsType>) {
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
    const entry = sections[searchQueryLabel(combo)];
    if (typeof entry !== 'undefined' && entry.state !== 'error') {
      return;
    }
    addToSections(searchQueryLabel(combo), { state: 'loading' });
    //Wait for latestSemester to be found
    if (latestSemester.current === '') {
      setTimeout(() => fetchAndStoreSectionsData(combo, controller), 100);
      return;
    }
    //Seperate to course and prof for seperate calls
    const seperatedCombo = [
      convertToCourseOnly(combo),
      convertToProfOnly(combo),
    ]
      //Remove empty objects (for non combos)
      .filter((obj) => Object.keys(obj).length !== 0);
    //Call each
    Promise.all(
      seperatedCombo.map((query) => fetchSectionsData(query, controller)),
    )
      .then((res: SectionsData[]) => {
        //Find intersection of all course sections and all professor sections
        let intersection: SectionsData = [];
        if (res.length === 1) {
          intersection = res[0];
        } else if (res.length === 2) {
          intersection = res[0].filter(
            (value) => res[1].findIndex((val) => val._id === value._id) !== -1,
          );
        }
        //Filter to only latestSemester
        const latest = intersection.filter(
          (section) => section.academic_session.name === latestSemester.current,
        );
        //Add to storage
        //Set loading status to done
        addToSections(searchQueryLabel(combo), {
          state: 'done',
          data: {
            all: intersection,
            latest: latest,
          },
        });
      })
      .catch(() => {
        //Set loading status to error
        addToSections(searchQueryLabel(combo), { state: 'error' });
      });
  }

  return [sections, setSections, fetchAndStoreSectionsData];
}
