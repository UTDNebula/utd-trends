'use client';

import { useEffect, useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import fetchAll from '@/modules/fetchAll';

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}

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
