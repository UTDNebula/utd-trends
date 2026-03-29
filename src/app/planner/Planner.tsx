'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import Split from '@/components/common/Split/Split';
import StickySide from '@/components/common/Split/StickySide';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import {
  getValidAvailabilitySemester,
  setAvailabilitySemester,
} from '@/modules/availability';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

/**
 * Returns the My Planner page
 */
export default function Planner() {
  const {
    planner,
    setTeachingSemester,
    availableSemesters,
    effectiveTeachingSemester,
  } = useSharedState();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync planner URL with teaching semester: URL is source of truth
  useEffect(() => {
    if (pathname !== '/planner') return;
    const availability = getValidAvailabilitySemester(
      searchParams,
      availableSemesters,
    );
    if (availability) {
      setTeachingSemester(availability);
    }

    const rawAvailability = searchParams.get('availability');
    if (effectiveTeachingSemester && rawAvailability !== effectiveTeachingSemester) {
      const params = new URLSearchParams(searchParams.toString());
      setAvailabilitySemester(params, effectiveTeachingSemester);
      window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }
  }, [
    pathname,
    searchParams,
    availableSemesters,
    setTeachingSemester,
    effectiveTeachingSemester,
  ]);

  return (
    <Split
      left={planner.length === 0 ? <PlannerEmpty /> : <PlannerCoursesTable />}
      right={
        <StickySide>
          <PlannerSchedule />
        </StickySide>
      }
      minLeft="30%"
      minRight="50%"
      defaultLeft="40%"
    />
  );
}
