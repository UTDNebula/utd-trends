import '@/styles/globals.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '@/../tailwind.config.js';
import FeedbackPopup from '@/components/common/FeedbackPopup/FeedbackPopup';
import GitHubButton from '@/components/common/GitHubButton/GitHubButton';
import useGradeStore from '@/modules/useGradeStore';
import usePersistantState from '@/modules/usePersistantState';
import useRmpStore from '@/modules/useRmpStore';
import useSectionsStore from '@/modules/useSectionsStore';
import {
  convertToCourseOnly,
  removeSection,
  type SearchQuery,
  searchQueryEqual,
  type SearchQueryMultiSection,
  sectionCanOverlap,
} from '@/types/SearchQuery';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});
const kallisto = localFont({
  src: [
    /*
    {
      path: '../fonts/Kallisto/Kallisto Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Thin Italic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Light Italic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Kallisto/Kallisto Medium Italic.otf',
      weight: '500',
      style: 'italic',
    },
    */
    {
      path: '../fonts/Kallisto/Kallisto Bold.otf',
      weight: '700',
      style: 'normal',
    },
    /*
    {
      path: '../fonts/Kallisto/Kallisto Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
    */
    {
      path: '../fonts/Kallisto/Kallisto Heavy.otf',
      weight: '900',
      style: 'normal',
    },
    /*
    {
      path: '../fonts/Kallisto/Kallisto Heavy Italic.otf',
      weight: '900',
      style: 'italic',
    },
    */
  ],
  variable: '--font-kallisto',
});

const fullTailwindConfig = resolveConfig(tailwindConfig);

function MyApp({ Component, pageProps }: AppProps) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const colors = fullTailwindConfig.theme.colors as any;
  const lightPalette = {
    palette: {
      //copied from tailwind.config.js
      primary: {
        main: colors.royal as string,
      },
      secondary: {
        main: colors.royal as string,
        light: colors.periwinkle as string,
      },
      error: {
        main: colors.persimmon['500'] as string,
      },
    },
  };
  const darkPalette = {
    palette: {
      //copied from tailwind.config.js
      primary: {
        main: colors.cornflower['300'] as string,
      },
      secondary: {
        main: colors.royal as string,
        light: colors.periwinkle as string,
      },
      error: {
        main: colors.persimmon['500'] as string,
      },
    },
  };
  const muiTheme = createTheme({
    cssVariables: true,
    colorSchemes: {
      light: lightPalette,
      dark: darkPalette,
    },
    typography: {
      fontFamily: 'inherit',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: parseInt(fullTailwindConfig.theme.screens.sm),
        md: parseInt(fullTailwindConfig.theme.screens.md),
        lg: parseInt(fullTailwindConfig.theme.screens.lg),
        xl: parseInt(fullTailwindConfig.theme.screens.xl),
      },
    },
  });

  const router = useRouter();

  //Store grades by course+prof combo
  const [grades, , fetchAndStoreGradesData, recalcGrades, recalcAllGrades] =
    useGradeStore();

  //Store rmp scores by profs
  const [rmp, , fetchAndStoreRmpData] = useRmpStore();

  //Store course+prof combos in planner
  const [planner, setPlanner] = usePersistantState<SearchQueryMultiSection[]>(
    'planner',
    [],
  );

  //Add a course+prof combo to planner (happens from search results)
  function addToPlanner(searchQuery: SearchQuery) {
    //If not already there
    if (planner.findIndex((obj) => searchQueryEqual(obj, searchQuery)) === -1) {
      //Add to list
      setPlanner(planner.concat([searchQuery]));
    }
  }

  //Remove a course+prof combo from compare
  function removeFromPlanner(searchQuery: SearchQuery) {
    //If already there
    if (planner.findIndex((obj) => searchQueryEqual(obj, searchQuery)) !== -1) {
      //Remove from list
      setPlanner(planner.filter((el) => !searchQueryEqual(el, searchQuery)));
    }
  }

  function setPlannerSection(searchQuery: SearchQuery, section: string) {
    setPlanner(
      planner.map((course) => {
        if (
          searchQueryEqual(removeSection(course), removeSection(searchQuery))
        ) {
          if (typeof course.sectionNumbers === 'undefined') {
            return { ...course, sectionNumbers: [section] };
          }
          if (course.sectionNumbers.includes(section)) {
            return {
              ...course,
              sectionNumbers: course.sectionNumbers.filter(
                (s) => s !== section,
              ),
            };
          } else {
            let newSections = course.sectionNumbers;
            if (!sectionCanOverlap(section)) {
              newSections = newSections.filter((s) => sectionCanOverlap(s));
            }
            return {
              ...course,
              sectionNumbers: newSections.concat([section]),
            };
          }
        } else if (
          searchQueryEqual(
            convertToCourseOnly(course),
            convertToCourseOnly(searchQuery),
          ) &&
          typeof course.sectionNumbers !== 'undefined'
        ) {
          //to remove from a different combo
          return {
            ...course,
            sectionNumbers: course.sectionNumbers.filter((s) =>
              sectionCanOverlap(s),
            ),
          };
        }
        return course;
      }),
    );
  }

  //Store sections by course+prof combo
  const [sections, , fetchAndStoreSectionsData] = useSectionsStore();

  return (
    <>
      <GoogleAnalytics gaId="G-CC86XR1562" />
      <Head>
        <title>UTD TRENDS</title>
        <meta key="og:title" property="og:title" content="UTD TRENDS" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/logoIcon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <ThemeProvider theme={muiTheme}>
        <div
          className={
            inter.variable +
            ' ' +
            kallisto.variable +
            ' h-full text-haiti dark:text-white'
          }
        >
          <Component
            {...pageProps}
            planner={planner}
            addToPlanner={addToPlanner}
            removeFromPlanner={removeFromPlanner}
            setPlannerSection={setPlannerSection}
            grades={grades}
            fetchAndStoreGradesData={fetchAndStoreGradesData}
            recalcGrades={recalcGrades}
            recalcAllGrades={recalcAllGrades}
            rmp={rmp}
            fetchAndStoreRmpData={fetchAndStoreRmpData}
            sections={sections}
            fetchAndStoreSectionsData={fetchAndStoreSectionsData}
          />
          <FeedbackPopup />
          <GitHubButton />
        </div>
      </ThemeProvider>
      <SpeedInsights route={router.pathname} />
    </>
  );
}

export default MyApp;
