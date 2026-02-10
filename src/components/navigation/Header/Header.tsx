import UTDTrendsLogoStandalone from '@/components/icons/UTDTrendsLogo/UTDTrendsLogo';
import SearchBar, {
  LoadingSearchBar,
} from '@/components/search/SearchBar/SearchBar';
import { Suspense } from 'react';
import { BaseHeader, type BaseHeaderProps } from './BaseHeader';
import HeaderChildren from './HeaderChildren';

export type HeaderProps = BaseHeaderProps & {
  isPlanner?: boolean;
  downloadRef?: React.RefObject<HTMLDivElement | null>;
};

const Header = (props: HeaderProps) => {
  const searchBar = !props.isPlanner ? (
    <Suspense
      fallback={
        <LoadingSearchBar
          className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
          input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
        />
      }
    >
      <SearchBar
        manageQuery="onSelect"
        className="order-last basis-full sm:order-none sm:basis-[32rem] shrink"
        input_className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-haiti"
      />
    </Suspense>
  ) : undefined;

  return (
    <BaseHeader
      logoIcon={<UTDTrendsLogoStandalone />}
      logoText={{ projectName: 'UTD TRENDS', byline: 'by Nebula Labs' }}
      searchBar={searchBar}
      itemVisibility={{
        logo: 'both',
        search: true,
      }}
      itemConfig={{
        search: {
          align: 'left',
          display: { md: 'adjacent', lg: 'inline' },
        },
      }}
      className="lg:px-16 min-h-18"
      {...props}
    >
      {props.children}

      <HeaderChildren {...props} />
    </BaseHeader>
  );
};

export default Header;
