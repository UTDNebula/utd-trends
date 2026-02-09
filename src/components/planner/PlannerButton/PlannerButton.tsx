'use client';

import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import Link from 'next/link';
import React from 'react';

type PlannerButtonProps = {
  isPlanner?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function PlannerButton({
  isPlanner = false,
  href = '/planner',
  onClick,
  className,
}: PlannerButtonProps) {
  return (
    <Button
      variant="contained"
      disableElevation
      size="large"
      className={`normal-case rounded-full whitespace-nowrap ${className ?? ''}`}
      component={Link}
      href={href}
      onClick={onClick}
      startIcon={isPlanner ? <SearchIcon /> : <BookIcon />}
    >
      {isPlanner ? 'Search Results' : 'My Planner'}
    </Button>
  );
}
