'use client';

import PlannerButton from '@/components/planner/PlannerButton/PlannerButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
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

  const plannerButtonProps = {
    isPlanner: props.isPlanner,
    href: props.isPlanner
      ? dashboardSearchTerms != null
        ? '/dashboard?' + dashboardSearchTerms
        : '/dashboard?availability=true'
      : '/planner',
    onClick: () =>
      !props.isPlanner
        ? sessionStorage.setItem(
            'dashboardSearchTerms',
            new URLSearchParams(window.location.search).toString(),
          )
        : null,
  };

  return (
    <>
      <div className="flex gap-x-2 sm:hidden">
        {/* When PlannerButton is moved to a bottom nav bar, remove the small size props from all the children in this div */}
        <PlannerButton {...plannerButtonProps} size="small" />
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </div>
      <div className="flex gap-x-2 max-sm:hidden">
        <PlannerButton {...plannerButtonProps} />
        <IconButton size="large">
          <MoreVertIcon />
        </IconButton>
      </div>
    </>
  );
}
