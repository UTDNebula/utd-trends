'use client';

import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';
import Button, { type ButtonProps } from '@mui/material/Button';
import Link from 'next/link';
import React from 'react';

type PlannerButtonProps = {
  isPlanner?: boolean;
  size?: ButtonProps['size'];
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function PlannerButton({
  isPlanner = false,
  size = 'large',
  href = '/planner',
  onClick,
  className,
}: PlannerButtonProps) {
  return (
    <Button
      variant="contained"
      disableElevation
      size={size}
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
