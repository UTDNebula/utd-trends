'use client';

import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import { useEffect, useState } from 'react';
import { type HeaderProps } from './Header';

export default function HeaderChildren(props: HeaderProps) {
  const [dashboardSearchTerms, setDashboardSearchTerms] = useState<
    null | string
  >(null);

  useEffect(() => {
    setDashboardSearchTerms(
      window.sessionStorage.getItem('dashboardSearchTerms'),
    );
  }, []);

  return (
    <>
      <PlannerButton
        isPlanner={props.isPlanner}
        href={
          props.isPlanner
            ? dashboardSearchTerms != null
              ? '/dashboard?' + dashboardSearchTerms
              : '/dashboard?availability=true'
            : '/planner'
        }
        onClick={() =>
          !props.isPlanner
            ? sessionStorage.setItem(
                'dashboardSearchTerms',
                new URLSearchParams(window.location.search).toString(),
              )
            : null
        }
      />
    </>
  );
}
