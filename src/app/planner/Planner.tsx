'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import Split from '@/components/common/Split/Split';
import StickySide from '@/components/common/Split/StickySide';
import ClubsBanner from '@/components/planner/ClubsBanner/ClubsBanner';
import PlannerCoursesTable, {
  LoadingPlannerCoursesTable,
} from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule, {
  LoadingPlannerSchedule,
} from '@/components/planner/PlannerSchedule/PlannerSchedule';
import { useAvailabilityUrlSync } from '@/modules/useAvailabilityUrlSync';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export function PlannerLoadingSkeleton() {
  return (
    <Split
      left={<LoadingPlannerCoursesTable />}
      right={
        <StickySide>
          <LoadingPlannerSchedule />
        </StickySide>
      }
      minLeft="30%"
      minRight="50%"
      defaultLeft="40%"
    />
  );
}

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

  useAvailabilityUrlSync({
    pathname,
    searchParams,
    availableSemesters,
    effectiveTeachingSemester,
    setTeachingSemester,
    enabled: pathname === '/planner',
  });

  return (
    <Split
      left={
        <div className="flex flex-col">
          {planner.filter(
            (entry) => entry.semester === effectiveTeachingSemester,
          ).length === 0 ? (
            <PlannerEmpty />
          ) : (
            <PlannerCoursesTable />
          )}
          <ClubsBanner />
        </div>
      }
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
