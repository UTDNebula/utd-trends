'use client';

import React, { useEffect, useState } from 'react';

import { useSharedState } from '@/app/SharedStateProvider';
import Split from '@/components/common/Split/Split';
import PlannerCoursesTable, {
  LoadingPlannerCoursesTable,
} from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import { type SearchQuery } from '@/types/SearchQuery';

interface Props {
  fetchPlannerData: (queries: SearchQuery[]) => Promise<{
    grades: { [key: string]: GenericFetchedData<Grades> };
    rmp: { [key: string]: GenericFetchedData<RMP> };
    sections: { [key: string]: GenericFetchedData<Sections> };
  }>;
}

/**
 * Returns the My Planner page
 */
export default function Planner(props: Props) {
  const { setGrades, setRmp, setSections, planner } = useSharedState();
  const [state, setState] = useState('loading');

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setState('loading');
      const { grades, rmp, sections } = await props.fetchPlannerData(planner);
      if (isCancelled) return;

      setGrades(grades);
      setRmp(rmp);
      setSections(sections);
      setState('done');
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [planner]);

  return (
    <Split
      left={
        planner.length === 0 ? (
          <PlannerEmpty />
        ) : state === 'loading' ? (
          <LoadingPlannerCoursesTable plannerLength={planner.length} />
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
