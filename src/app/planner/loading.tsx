import React from 'react';

import Split from '@/components/common/Split/Split';
import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import {
  LoadingPlannerCoursesTable,
} from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';

/**
 * Returns the loading My Planner page
 */
export default function Page() {
  return (
    <>
      <TopMenu isPlanner={true} />
      <main className="p-4">
        <Split
          left={<LoadingPlannerCoursesTable plannerLength={5} />}
          right={<PlannerSchedule />}
          minLeft={30}
          minRight={50}
          defaultLeft={40}
        />
      </main>
    </>
  );
}
