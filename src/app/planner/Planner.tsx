'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import Split from '@/components/common/Split/Split';
import StickySide from '@/components/common/Split/StickySide';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import React from 'react';

/**
 * Returns the My Planner page
 */
export default function Planner() {
  const { planner } = useSharedState();

  return (
    <Split
      left={planner.length === 0 ? <PlannerEmpty /> : <PlannerCoursesTable />}
      right={
        <StickySide>
          <PlannerSchedule />
        </StickySide>
      }
      minLeft={30}
      minRight={50}
      defaultLeft={40}
    />
  );
}
