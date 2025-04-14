import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef } from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

import TopMenu from '@/components/navigation/TopMenu/TopMenu';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerEmpty from '@/components/planner/PlannerEmpty/PlannerEmpty';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import { plannerColors } from '@/modules/colors';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { GenericFetchedData } from '@/types/GenericFetchedData';
import type { GradesType } from '@/types/GradesType';
import {
  convertToCourseOnly,
  convertToProfOnly,
  removeSection,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQueryMultiSection,
  searchQueryMultiSectionSplit,
} from '@/types/SearchQuery';
import type { SectionsType } from '@/types/SectionsType';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

function createColorMap(courses: SearchQuery[]): {
  [key: string]: { fill: string; outline: string; font: string };
} {
  const colorMap: {
    [key: string]: { fill: string; outline: string; font: string };
  } = {};
  courses.forEach((course, index) => {
    colorMap[searchQueryLabel(course)] =
      plannerColors[index % plannerColors.length];
  });
  return colorMap;
}

interface Props {
  planner: SearchQueryMultiSection[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  grades: {
    [key: string]: GenericFetchedData<GradesType>;
  };
  setPlannerSection: (searchQuery: SearchQuery, section: string) => boolean;
  fetchAndStoreGradesData: (
    course: SearchQuery,
    controller: AbortController,
  ) => Promise<GradesType | null>;
  rmp: {
    [key: string]: GenericFetchedData<RMPInterface>;
  };
  fetchAndStoreRmpData: (
    course: SearchQuery,
    controller: AbortController,
  ) => void;
  sections: {
    [key: string]: GenericFetchedData<SectionsType>;
  };
  fetchAndStoreSectionsData: (
    combo: SearchQuery,
    controller: AbortController,
  ) => void;
}

export const MyPlanner: NextPage<Props> = (props: Props): React.ReactNode => {
  const planner = props.planner;

  //Don't need to rerun fetches when these change
  const fetchAndStoreGradesData = useRef(props.fetchAndStoreGradesData);
  useEffect(() => {
    fetchAndStoreGradesData.current = props.fetchAndStoreGradesData;
  }, [props.fetchAndStoreGradesData]);
  const fetchAndStoreRmpData = useRef(props.fetchAndStoreRmpData);
  useEffect(() => {
    fetchAndStoreSectionsData.current = props.fetchAndStoreSectionsData;
  }, [props.fetchAndStoreSectionsData]);
  const fetchAndStoreSectionsData = useRef(props.fetchAndStoreSectionsData);
  useEffect(() => {
    fetchAndStoreSectionsData.current = props.fetchAndStoreSectionsData;
  }, [props.fetchAndStoreSectionsData]);
  useEffect(() => {
    // console.log('hi');
    if (planner.length) {
      //To cancel on rerender
      const controller = new AbortController();

      //Grade data
      //Fetch each result
      for (const result of planner) {
        const sectionlessResult = removeSection(result);
        fetchAndStoreGradesData.current(sectionlessResult, controller);
      }

      //RMP data
      //Get list of profs from results
      //Remove duplicates so as not to fetch multiple times
      const professorsInResults = removeDuplicates(
        planner
          //Remove course data from each
          .map((result) => convertToProfOnly(result))
          //Remove empty objects (used to be only course data)
          .filter((obj) => Object.keys(obj).length !== 0) as SearchQuery[],
      );
      //Fetch each professor
      for (const professor of professorsInResults) {
        fetchAndStoreRmpData.current(professor, controller);
      }

      //Section data
      for (const result of planner) {
        const sectionlessResult = removeSection(result);
        fetchAndStoreSectionsData.current(sectionlessResult, controller);
      }

      return () => {
        controller.abort();
      };
    }
  }, [planner]);

  let results: GenericFetchedData<SearchQueryMultiSection[]> = {
    state: 'loading',
  };
  if (planner.length) {
    results = {
      state: 'done',
      data: planner,
    };
  }

  const colorMap = createColorMap(
    results.state === 'done'
      ? removeDuplicates(
          results.data.map((searchQuery) => convertToCourseOnly(searchQuery)),
        )
      : [],
  );

  const panelLRef = useRef<ImperativePanelHandle>(null);
  const panelRRef = useRef<ImperativePanelHandle>(null);
  // Resets RHS & LHS to 40/60 when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(40);
  };

  const plannerCoursesTable = (
    <PlannerCoursesTable
      courses={results.state === 'done' ? results.data : []}
      addToPlanner={props.addToPlanner}
      removeFromPlanner={props.removeFromPlanner}
      setPlannerSection={props.setPlannerSection}
      sections={props.sections}
      grades={props.grades}
      rmp={props.rmp}
      colorMap={colorMap}
    />
  );
  const plannerEmpty = <PlannerEmpty />;
  const plannerSchedule = (
    <PlannerSchedule
      courses={
        results.state === 'done'
          ? results.data.flatMap((searchQuery) =>
              searchQueryMultiSectionSplit(searchQuery),
            )
          : []
      }
      sections={props.sections}
      colorMap={colorMap}
    />
  );

  const contentComponent = (
    <>
      <div className="sm:hidden">
        {results.state === 'loading' ? plannerEmpty : plannerCoursesTable}
        {plannerSchedule}
      </div>
      <PanelGroup
        direction="horizontal"
        className="hidden sm:flex overflow-visible"
      >
        <Panel ref={panelLRef} minSize={30} defaultSize={40}>
          {results.state === 'loading' ? plannerEmpty : plannerCoursesTable}
        </Panel>
        <PanelResizeHandle
          className="mt-4 p-1 mx-1 w-0.5 rounded-full opacity-25 data-[resize-handle-state=drag]:opacity-50 transition ease-in-out bg-transparent hover:bg-royal data-[resize-handle-state=drag]:bg-royal"
          onDoubleClick={handleResizeDoubleClick}
        />
        <Panel
          className="overflow-visible min-w-0"
          ref={panelRRef}
          minSize={50}
          defaultSize={60}
        >
          <div className="sticky top-4 mt-4">{plannerSchedule}</div>
        </Panel>
      </PanelGroup>
    </>
  );

  return (
    <>
      <Head>
        <title>Planner - UTD TRENDS</title>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/planner"
          key="canonical"
        />
        <meta
          key="og:title"
          property="og:title"
          content="Planner - UTD TRENDS"
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/planner"
        />
      </Head>
      <div className="w-full bg-light h-full">
        <TopMenu isPlanner />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default MyPlanner;
