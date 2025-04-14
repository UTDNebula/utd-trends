'use client';

import React, { useEffect, useState } from 'react';

import Split from '@/components/common/Split/Split';
import { useSharedState } from './SharedStateProvider';
import {
  type SearchQuery,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { Grades } from '@/modules/fetchGrades';
import type { RMP } from '@/modules/fetchRmp';
import type { Sections } from '@/modules/fetchSections';
import PlannerCoursesTable, {
  LoadingPlannerCoursesTable,
} from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';

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
  useEffect(async () => {
    setState('loading');
    const { grades, rmp, sections } = await props.fetchPlannerData(planner);
    setGrades(grades);
    setRmp(rmp);
    setSections(sections);
    setState('done');
  }, planner);

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
