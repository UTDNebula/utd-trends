'use client';

import gradientBG from '@/../public/background.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Determines when a color should be styled light or dark
 * - `"light"` Component is always styled light-colored
 * - `"dark"` Component is always styled dark-color
 * - `"lightDark"` Component is styled light-colored in light mode and dark-colored in dark mode
 * - `"darkLight"` Component is styled dark-colored in light mode and light-colored in dark mode
 */
export type ContentComponentColor =
  | 'light'
  | 'dark'
  | 'lightDark'
  | 'darkLight';

export type HeaderItemVisibility = {
  menu?: boolean;
  /**
   * Visibility options for the header logo. Valid options:
   * - `true` Automatically switches between "both" or "text" based on screen size
   * - `false` Disabled
   * - `"both"` Always show both the logo icon and text
   * - `"icon"` Only ever show the logo icon
   * - `"text"` Only ever show the logo text
   * @default true
   */
  logo?: true | false | 'both' | 'icon' | 'text';
  /**
   * Visibility options for the header search bar. Valid options:
   * - `true` Automatically switches between "full" or "compact" based on screen size
   * - `false` Disabled
   * - `"full"` Always show full search bar
   * - `"compact"` Always show collapsed search button
   * @default true
   */
  // search?: true | false | 'full' | 'compact';
  search?: true | false;
  children?: boolean;
  account?: boolean;
};

type SearchDisplayValues = 'inline' | 'collapsible' | 'adjacent' | 'hidden';

export type HeaderItemConfig = {
  search?: {
    /**
     * Visibility options for the header search bar. Valid options:
     * - `"inline"` Show full search bar inside the header
     * - `"collapsible"` Collapse search bar behind a compact search button
     * - `"adjacent"` Show full search bar beneath the header
     * - `"hidden"` Hides the search bar
     *
     * If an object is provided, sets search bar visibility options that depend on screen size
     * @example <caption>"inline" on large screens, "collapsible" on small screens</caption>
     * {md: "collapsiblie", lg: "inline"}
     *
     * @default {md: "collapsiblie", lg: "inline"}
     */
    display?:
      | SearchDisplayValues
      | {
          md: SearchDisplayValues;
          lg: SearchDisplayValues;
        };
    /**
     * Alignment of the search bar
     * @default "center"
     */
    align?: 'left' | 'center' | 'right';
  };
};

export type BaseHeaderProps = {
  children?: ReactNode;
  className?: string;
  /**
   * Component displayed for menu slot
   */
  menu?: ReactNode;
  /**
   * Component displayed for logo icon slot
   */
  logoIcon?: ReactNode;
  /**
   * Logo text displayed adjacently to logo icon
   */
  logoText?: {
    projectName?: string;
    byline?: string;
  };
  /**
   * Component displayed for search bar slot. If prop is omitted, search functionality is not displayed
   */
  searchBar?: ReactNode;
  /**
   * Component displayed for account slot
   */
  account?: ReactNode;
  /**
   * Manages the visibility of items in the header
   */
  itemVisibility?: HeaderItemVisibility;
  /**
   * Optional config for items in the header
   */
  itemConfig?: HeaderItemConfig;
  /**
   * Hides the background image on the header
   * @default false
   */
  transparent?: boolean;
  /**
   * Adds text and drop shadows to header items
   * @default false
   */
  shadow?: boolean;
  /**
   * Stops the header from sticking to the top of the page
   * @default false
   */
  disableSticky?: boolean;
  /**
   * Determines the color of UI elements. Valid options:
   * - `"light"` UI elements are white
   * - `"dark"` UI elements are black
   * - `"lightDark"` UI elements are white in light mode and black in dark mode
   * - `"darkLight"` UI elements are black in light mode and white in dark mode
   * @default "darkLight"
   */
  color?: ContentComponentColor;
};

/**
 * Context for child components of BaseHeader
 */
export const BaseHeaderContext = createContext({
  openCompactSearchBar: false,
});

export function useBaseHeaderContext() {
  return useContext(BaseHeaderContext);
}

export const BaseHeader = ({
  children,
  className,
  menu,
  logoIcon,
  logoText: {
    projectName: logoTextProjectName = 'Project Name',
    byline: logoTextByline = 'by Nebula Labs',
  } = {},
  searchBar,
  account,
  itemVisibility: {
    menu: menuVisibility = true,
    logo: logoVisibility = true,
    search: searchVisibility = true,
    children: childrenVisibility = true,
    account: accountVisibility = true,
  } = {},
  itemConfig: {
    search: {
      display: itemConfigSearchDisplay = {
        md: 'collapsible',
        lg: 'inline',
      } as const,
      align: itemConfigSearchAlign = 'center',
    } = {},
  } = {},
  transparent = false,
  shadow = false,
  disableSticky = false,
  color = 'darkLight',
}: BaseHeaderProps) => {
  const logoIconVisibility =
    logoVisibility === true ||
    logoVisibility === 'both' ||
    logoVisibility === 'icon';
  const logoTextVisibility =
    logoVisibility === true ||
    logoVisibility === 'both' ||
    logoVisibility === 'text';

  // If true, then the visible search bar will switch depending on screen size
  const dynamicSearchBarSwapping = typeof itemConfigSearchDisplay !== 'string';

  const dynamicVisibilityClasses = (display: SearchDisplayValues) => {
    if (dynamicSearchBarSwapping) {
      const classes = [];

      if (itemConfigSearchDisplay.md !== display) classes.push('max-md:hidden');
      if (itemConfigSearchDisplay.lg !== display) classes.push('md:hidden');
      return classes.join(' ');
    }
    return '';
  };

  const searchBarComponentVisibility = (display: SearchDisplayValues) => {
    if (!searchVisibility) return false;
    return dynamicSearchBarSwapping
      ? // Enable specific search bar component if required for dynamic swapping
        itemConfigSearchDisplay.md === display ||
          itemConfigSearchDisplay.lg === display
      : // Enable specific search bar component if directly enabled
        itemConfigSearchDisplay === display;
  };

  const inlineSearchBarVisibility = searchBarComponentVisibility('inline');
  const collapsibleSearchBarVisibility =
    searchBarComponentVisibility('collapsible');
  const adjacentSearchBarVisibility = searchBarComponentVisibility('adjacent');

  const [openCompactSearchBar, setOpenCompactSearchBar] = useState(false);

  return (
    <BaseHeaderContext.Provider value={{ openCompactSearchBar }}>
      <div
        className={`${disableSticky ? '' : 'sticky'} min-h-17 top-0 z-50 flex w-full justify-between items-center gap-y-2 gap-x-2 md:gap-x-4 lg:gap-x-8 py-2 px-4 ${menu || openCompactSearchBar ? 'max-sm:pl-2' : ''} flex-wrap sm:flex-nowrap ${transparent ? '' : 'bg-lighten dark:bg-darken'} ${className}`}
      >
        {!transparent && (
          <>
            <Image
              src={gradientBG}
              alt="gradient background"
              fill
              className="object-cover -z-20 select-none"
              sizes="120vw"
            />
            <div className="absolute inset-0 bg-lighten dark:bg-darken -z-10"></div>
          </>
        )}
        {!openCompactSearchBar ? (
          // Main header
          <>
            {/* Left */}
            <div
              className={`basis-0 flex gap-x-2 sm:gap-x-8 ${itemConfigSearchAlign !== 'left' ? 'grow' : ''}`}
            >
              {menuVisibility && menu}
              {logoVisibility && (
                <Link
                  href="/"
                  className={`font-display flex gap-2 items-center select-none ${
                    color?.startsWith('light') ? 'text-white' : 'text-haiti'
                  } ${
                    color === 'lightDark'
                      ? 'dark:text-haiti'
                      : color === 'darkLight'
                        ? 'dark:text-white'
                        : ''
                  } ${shadow ? 'drop-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]' : ''}`}
                >
                  {logoIconVisibility && (
                    <div
                      className={`flex flex-row items-center ${logoVisibility === true ? 'max-sm:hidden' : ''}`}
                    >
                      <div
                        className={`*:h-10 *:w-auto ${
                          color?.startsWith('light')
                            ? '*:fill-white'
                            : '*:fill-haiti'
                        } ${
                          color === 'lightDark'
                            ? '*:dark:fill-haiti'
                            : color === 'darkLight'
                              ? '*:dark:fill-white'
                              : ''
                        }`}
                      >
                        {logoIcon}
                      </div>
                    </div>
                  )}
                  {logoTextVisibility && (
                    <div className="flex flex-col">
                      <span className="whitespace-nowrap text-lg md:text-xl font-bold leading-5">
                        {logoTextProjectName}
                      </span>
                      <span className="whitespace-nowrap text-xs md:text-sm font-medium">
                        {logoTextByline}
                      </span>
                    </div>
                  )}
                </Link>
              )}
            </div>

            {/* Center */}
            {inlineSearchBarVisibility && searchBar && (
              <div
                className={`order-last max-sm:basis-full basis-128 sm:order-none ${dynamicVisibilityClasses('inline')} ${shadow ? 'drop-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]' : ''}`}
              >
                {searchBar}
              </div>
            )}

            {/* Right */}
            <div
              className={`basis-0 flex justify-end items-center gap-x-2 ${shadow ? 'drop-shadow-[0_0_4px_rgb(0_0_0_/_0.2)]' : ''} ${itemConfigSearchAlign !== 'right' ? 'grow' : ''}`}
            >
              {collapsibleSearchBarVisibility && searchBar && (
                <IconButton
                  size="large"
                  className={`${dynamicVisibilityClasses('collapsible')}`}
                  onClick={() => setOpenCompactSearchBar((prev) => !prev)}
                >
                  <SearchIcon />
                </IconButton>
              )}
              {childrenVisibility && children}
              {accountVisibility && account}
            </div>
          </>
        ) : (
          // Collapsible search bar
          <div className="w-full flex justify-center">
            <div className="w-full max-w-128 flex gap-x-2 items-center">
              <IconButton
                size="large"
                onClick={() => setOpenCompactSearchBar(false)}
              >
                <ArrowBackIcon />
              </IconButton>
              {collapsibleSearchBarVisibility && (
                <div className="grow">{searchBar}</div>
              )}
            </div>
          </div>
        )}
      </div>
      {adjacentSearchBarVisibility && searchBar ? (
        <div className="px-4 py-2">
          <div
            className={`max-w-128 ${dynamicVisibilityClasses('adjacent')} ${shadow ? 'drop-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]' : ''}`}
          >
            {searchBar}
          </div>
        </div>
      ) : undefined}
    </BaseHeaderContext.Provider>
  );
};
