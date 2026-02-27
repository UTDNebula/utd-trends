'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function MobileNavBar() {
  const { isCompareOpen, setIsCompareOpen } = useSharedState();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeTab =
    pathname === '/dashboard'
      ? isCompareOpen
        ? 'compare'
        : 'search'
      : pathname === '/planner' ? 'planner' : 'search';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] block bg-white shadow-md dark:bg-haiti md:hidden pb-[env(safe-area-inset-bottom)]">
      <BottomNavigation
        showLabels
        value={activeTab}
        onChange={(event, newValue) => {
          // store search terms in session storage when navigating away from the dashboard
          if (
            pathname === '/dashboard' &&
            !(params.size === 1 && params.get('availability') === 'true') // if the search terms lead to an empty dashboard, don't store
          ) {
            sessionStorage.setItem('dashboardSearchTerms', params.toString());
          }
          // navigation
          if (newValue === 'search') {
            setIsCompareOpen(false);
            const dashboardSearchTerms = window.sessionStorage.getItem(
              'dashboardSearchTerms',
            );
            router.push(
              dashboardSearchTerms ? '/dashboard?' + dashboardSearchTerms : '/', // if no stored search terms, we can just go to landing page
            );
          } else if (newValue === 'compare') {
            setIsCompareOpen(true);
            const dashboardSearchTerms = window.sessionStorage.getItem(
              'dashboardSearchTerms',
            );
            setTimeout(() => {
              router.push(
                dashboardSearchTerms
                  ? '/dashboard?' + dashboardSearchTerms
                  : '/dashboard?availability=true', // if no stored search terms, we still need dashboard to show compare
              );
            }, 0);
          } else {
            // going to /planner
            // setIsCompareOpen(false);
            router.push('/planner');
          }
        }}
      >
        <BottomNavigationAction
          label="Search"
          value="search"
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label="Compare"
          value="compare"
          icon={<CompareArrowsIcon />}
        />
        <BottomNavigationAction
          label="MyPlanner"
          value="planner"
          icon={<MenuBookIcon />}
        />
      </BottomNavigation>
    </div>
  );
}
