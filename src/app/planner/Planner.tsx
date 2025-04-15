'use client';

import React from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import Split from '@/components/common/Split/Split';
import PlannerCoursesTable, {
  LoadingPlannerCoursesTable,
} from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';

/**
 * Returns the My Planner page
 */
export default function Planner() {
  const { sections, planner } = useSharedState();

  return (
    <Split
      left={
        planner.length === 0 ? (
          <PlannerEmpty />
        ) : Object.keys(sections).length === 0 ? (
          <LoadingPlannerCoursesTable />
        ) : (
          <PlannerCoursesTable />
        )
      }
      right={<PlannerSchedule />}
      minLeft={30}
      minRight={50}
      defaultLeft={40}
    />
  );
}
