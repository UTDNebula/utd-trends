'use client';

import { useEffect } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import fetchAll from '@/modules/fetchAll';
import useHasHydrated from '@/modules/useHasHydrated';

export default function SyncServerDataToContext() {
  const hasHydrated = useHasHydrated();
  const { setGrades, setRmp, setSections, planner } = useSharedState();

  useEffect(() => {
    if (hasHydrated) {
      let isCancelled = false;

      const fetchData = async () => {
        const { grades, rmp, sections } = await fetchAll(planner);
        if (isCancelled) return;

        setGrades(grades);
        setRmp(rmp);
        setSections(sections);
      };

      fetchData();

      return () => {
        isCancelled = true;
      };
    }
  }, [hasHydrated, setGrades, setRmp, setSections, planner]);

  return null;
}
