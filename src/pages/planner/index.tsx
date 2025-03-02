import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef } from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

import TopMenu from '@/components/navigation/topMenu/topMenu';
import MyPlannerEmpty from '@/components/planner/MyPlannerEmpty/myPlannerEmpty';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/plannerCoursesTable';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { SectionData } from '@/pages/api/sections';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

interface Props {
  planner: SearchQuery[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
  grades: {
    [key: string]: GenericFetchedData<GradesType>;
  };
  fetchAndStoreGradesData: (
    course: SearchQuery,
    controller: AbortController,
  ) => Promise<GradesType | null>;
  recalcGrades: (course: SearchQuery) => void;
  recalcAllGrades: (results: SearchQuery[], academicSessions: string[]) => void;
  rmp: {
    [key: string]: GenericFetchedData<RMPInterface>;
  };
  fetchAndStoreRmpData: (
    course: SearchQuery,
    controller: AbortController,
  ) => void;
  sections: {
    [key: string]: GenericFetchedData<SectionData>;
  };
  fetchAndStoreSectionsData: (
    combo: SearchQuery,
    controller: AbortController,
  ) => void;
}

export const MyPlanner: NextPage<Props> = (props: Props): React.ReactNode => {
  const planner = props.planner;
  useEffect(() => {
    if (planner.length) {
      //To cancel on rerender
      const controller = new AbortController();

      //Grade data
      //Fetch each result
      for (const result of planner) {
        const entry = props.grades[searchQueryLabel(result)];
        //Not already loading
        if (typeof entry === 'undefined' || entry.state === 'error') {
          props.fetchAndStoreGradesData(result, controller);
        }
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
        const entry = props.rmp[searchQueryLabel(professor)];
        //Not already loading
        if (typeof entry === 'undefined' || entry.state === 'error') {
          props.fetchAndStoreRmpData(professor, controller);
        }
      }

      //Section data
      for (const result of planner) {
        const entry = props.sections[searchQueryLabel(result)];
        //Not already loading
        if (typeof entry === 'undefined' || entry.state === 'error') {
          props.fetchAndStoreSectionsData(result, controller);
        }
      }

      return () => {
        controller.abort();
      };
    }
  }, [planner]);
  console.log(props.grades, props.rmp, props.sections);

  let results: GenericFetchedData<SearchQuery[]> = {
    state: 'loading',
  };
  if (planner.length) {
    results = {
      state: 'done',
      data: planner,
    };
  }
  console.log('COURSES IN PLANNER: ', results);

  const panelLRef = useRef<ImperativePanelHandle>(null);
  const panelRRef = useRef<ImperativePanelHandle>(null);
  // Resets RHS & LHS to 50/50 when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(50);
  };

  //Main content: loading, error, or normal
  let contentComponent;

  if (results.state === 'done' && !results.data.length) {
    contentComponent = <MyPlannerEmpty />;
  } else {
    const plannerCoursesTable = <PlannerCoursesTable />;

    contentComponent = (
      <>
        <div className="sm:hidden">
          {}
          {plannerCoursesTable}
        </div>
        <PanelGroup
          direction="horizontal"
          className="hidden sm:flex overflow-visible"
        >
          <Panel ref={panelLRef} minSize={40} defaultSize={50}>
            {plannerCoursesTable}
          </Panel>
          <PanelResizeHandle
            className="mt-4 p-1 mx-1 w-0.5 rounded-full opacity-25 data-[resize-handle-state=drag]:opacity-50 transition ease-in-out bg-transparent hover:bg-royal data-[resize-handle-state=drag]:bg-royal"
            onDoubleClick={handleResizeDoubleClick}
          />
          <Panel
            className="overflow-visible min-w-0"
            ref={panelRRef}
            minSize={30}
            defaultSize={70}
          >
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto mt-4">
              {}
            </div>
          </Panel>
        </PanelGroup>
      </>
    );
  }

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
        <TopMenu
          resultsLoading={results.state}
          setResultsLoading={() => {}}
          isPlanner={true}
        />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default MyPlanner;
