'use client';

import { useSharedState } from '@/app/SharedStateProvider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import { Badge, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const usefulParams = new URLSearchParams(useSearchParams().toString());
  usefulParams.delete('compare');
  const { compare, planner } = useSharedState();

  const activeTab =
    pathname === '/dashboard'
      ? params.get('compare') === 'true'
        ? 'compare'
        : 'search'
      : pathname === '/planner'
        ? 'planner'
        : 'search';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] block bg-white shadow-md dark:bg-haiti md:hidden pb-[env(safe-area-inset-bottom)]">
      <BottomNavigation
        showLabels
        value={activeTab}
        onChange={(event, newValue) => {
          // store search terms in session storage when navigating away from the dashboard
          if (
            pathname === '/dashboard' && //TODO:
            !(
              usefulParams.size === 1 &&
              usefulParams.get('availability') === 'true'
            ) // if the search terms lead to an empty dashboard, don't store
          ) {
            sessionStorage.setItem(
              'dashboardSearchTerms',
              usefulParams.toString(),
            );
          }
          // navigation
          if (newValue === 'search') {
            const dashboardSearchTerms = window.sessionStorage.getItem(
              'dashboardSearchTerms',
            );
            router.push(
              dashboardSearchTerms ? '/dashboard?' + dashboardSearchTerms : '/', // if no stored search terms, we can just go to landing page
            );
          } else if (newValue === 'compare') {
            const dashboardSearchTerms = window.sessionStorage.getItem(
              'dashboardSearchTerms',
            );
            router.push(
              dashboardSearchTerms
                ? '/dashboard?' + dashboardSearchTerms + '&compare=true'
                : '/dashboard?availability=true&compare=true', // if no stored search terms, we still need dashboard to show compare
            );
          } else {
            // going to /planner
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
          icon={
            <Badge
              badgeContent={activeTab === 'compare' ? 0 : compare.length}
              color="primary"
              sx={{
                '& .MuiBadge-badge': { right: -12, top: 4 } 
              }}
            >
              <CompareArrowsIcon />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="MyPlanner"
          value="planner"
          icon={
            <Badge
                badgeContent={activeTab === 'planner' ? 0 : planner.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': { right: -15, top: 4 } 
                }}
              >
                <MenuBookIcon />
              </Badge>
            }
        />
      </BottomNavigation>
    </div>
  );
}
