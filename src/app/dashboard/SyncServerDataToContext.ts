'use client';

import { useEffect, useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

interface Props {
  grades: { [key: string]: GenericFetchedData<Grades> };
  rmp: { [key: string]: GenericFetchedData<RMP> };
  sections: { [key: string]: GenericFetchedData<Sections> };
}

export default function SyncServerDataToContext({
  grades,
  rmp,
  sections,
}: Props) {
  const hasHydrated = useHasHydrated();
  const { setGrades, setRmp, setSections } = useSharedState();

  useEffect(() => {
    if (hasHydrated) {
      setGrades(grades);
      setRmp(rmp);
      setSections(sections);
    }
  }, [hasHydrated, grades, rmp, sections, setGrades, setRmp, setSections]);

  return null;
}
