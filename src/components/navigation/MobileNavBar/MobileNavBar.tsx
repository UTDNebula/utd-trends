'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileNavBar() {
  const { setIsCompareOpen } = useSharedState();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab =
    pathname === '/dashboard' || pathname === '/' ? '/' : pathname;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] block bg-white shadow-md dark:bg-haiti md:hidden pb-[env(safe-area-inset-bottom)]">
      <BottomNavigation
        showLabels
        value={activeTab}
        onChange={(event, newValue) => {
          if (newValue === '/') {
            setIsCompareOpen(false);
            const dashboardSearchTerms = window.sessionStorage.getItem(
              'dashboardSearchTerms',
            );
            router.push(
              dashboardSearchTerms ? '/dashboard?' + dashboardSearchTerms : '/',
            );
          } else if (newValue == '/compare') {
            setIsCompareOpen(true);
          } else {
            // going to /planner
            setIsCompareOpen(false);
            if (pathname === '/dashboard') {
              sessionStorage.setItem(
                'dashboardSearchTerms',
                new URLSearchParams(window.location.search).toString(),
              );
            }
            router.push(newValue);
          }
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
