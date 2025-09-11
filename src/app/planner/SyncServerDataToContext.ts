'use client';

import { useEffect } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import fetchAll from '@/modules/fetchAll';
import useHasHydrated from '@/modules/useHasHydrated';

export default function SyncServerDataToContext() {
  const hasHydrated = useHasHydrated();
  const {
    setGrades,
    setRmp,
    setSections,
    setCourseNames,
    setLatestSemester,
    planner,
    compare,
  } = useSharedState();

  useEffect(() => {
    if (hasHydrated) {
      let isCancelled = false;

      const fetchData = async () => {
        const { grades, rmp, sections, courseNames, latestSemester } =
          await fetchAll(planner.concat(compare));
        if (isCancelled) return;

        setGrades(grades);
        setRmp(rmp);
        setSections(sections);
        setCourseNames(courseNames);
        setLatestSemester(latestSemester);
      };

      fetchData();

      return () => {
        isCancelled = true;
      };
    }
  }, [
    hasHydrated,
    setGrades,
    setRmp,
    setSections,
    setCourseNames,
    setLatestSemester,
    planner,
    compare,
  ]);

  return null;
}
