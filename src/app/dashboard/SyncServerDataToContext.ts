'use client';

import { useEffect } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import useHasHydrated from '@/modules/useHasHydrated';
import type { GenericFetchedData } from '@/types/GenericFetchedData';

interface Props {
  grades: { [key: string]: GenericFetchedData<Grades> };
  rmp: { [key: string]: GenericFetchedData<RMP> };
  sections: { [key: string]: GenericFetchedData<Sections> };
  courseNames: { [key: string]: string | undefined };
  latestSemester: string;
}

export default function SyncServerDataToContext({
  grades,
  rmp,
  sections,
  courseNames,
  latestSemester,
}: Props) {
  const hasHydrated = useHasHydrated();
  const { setGrades, setRmp, setSections, setCourseNames, setLatestSemester } =
    useSharedState();

  useEffect(() => {
    if (hasHydrated) {
      setGrades(grades);
      setRmp(rmp);
      setSections(sections);
      setCourseNames(courseNames);
      setLatestSemester(latestSemester);
    }
  }, [
    hasHydrated,
    grades,
    rmp,
    sections,
    courseNames,
    latestSemester,
    setGrades,
    setRmp,
    setSections,
    setCourseNames,
    setLatestSemester,
  ]);

  return null;
}
