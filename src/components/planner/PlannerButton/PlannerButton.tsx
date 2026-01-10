'use client';

import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import Link from 'next/link';
import React from 'react';

/**
 * Props type used by the TopMenu component
 */
type Props = {
  isPlanner?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * This component is located at the top of the page. From left to right, it holds the UTD Trends logo (component name NebulaLogo), a search box (component name SearchBar), a "Search" button, the "My Planner" button if you are on the Search Results page (or "Search Results" if you are on the Planner page), a button to see what is new in Trends, a help button, and a share button.
 * @returns
 */
export default function PlannerButton({
  isPlanner = false,
  href = '/planner',
  onClick,
  className,
}: Props) {
  return (
    <Button
      variant="contained"
      disableElevation
      size="large"
      className={`px-4 normal-case rounded-3xl ${className ?? ''}`}
      component={Link}
      href={href}
      onClick={onClick}
    >
      {isPlanner ? (
        <SearchIcon className="mr-2" />
      ) : (
        <BookIcon className="mr-2" />
      )}
      {isPlanner ? 'Search Results' : 'My Planner'}
    </Button>
  );
}
