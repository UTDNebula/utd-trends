'use client';

import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export default function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = React.useState(pathname);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] block shadow-md md:hidden">
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          router.push(newValue);
        }}
      >
        <BottomNavigationAction
          label="Search"
          value="/"
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label="Compare"
          value="/compare"
          icon={<CompareArrowsIcon />}
        />
        <BottomNavigationAction
          label="MyPlanner"
          value="/planner"
          icon={<MenuBookIcon />}
        />
      </BottomNavigation>
    </div>
  );
}
