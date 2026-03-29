import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  getValidAvailabilitySemester,
  setAvailabilitySemester,
} from './availability';

type UseAvailabilityUrlSyncArgs = {
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
  availableSemesters: string[];
  effectiveTeachingSemester: string;
  setTeachingSemester: (semester: string) => void;
  enabled?: boolean;
};

export function useAvailabilityUrlSync({
  pathname,
  searchParams,
  availableSemesters,
  effectiveTeachingSemester,
  setTeachingSemester,
  enabled = true,
}: UseAvailabilityUrlSyncArgs) {
  const params = new URLSearchParams(searchParams.toString());
  const rawAvailability = params.get('availability');
  const availabilitySemester = getValidAvailabilitySemester(
    params,
    availableSemesters,
  );

  useEffect(() => {
    if (!enabled) return;

    if (availabilitySemester) {
      setTeachingSemester(availabilitySemester);
      return;
    }

    if (rawAvailability !== null && effectiveTeachingSemester) {
      const updatedParams = new URLSearchParams(searchParams.toString());
      setAvailabilitySemester(updatedParams, effectiveTeachingSemester);
      window.history.replaceState(
        null,
        '',
        `${pathname}?${updatedParams.toString()}`,
      );
    }
  }, [
    enabled,
    availabilitySemester,
    rawAvailability,
    effectiveTeachingSemester,
    pathname,
    searchParams,
    setTeachingSemester,
  ]);

  return { rawAvailability, availabilitySemester };
}
