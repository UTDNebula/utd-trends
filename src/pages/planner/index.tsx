import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useRef } from 'react';
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
import { type SearchQuery } from '@/modules/SearchQuery/SearchQuery';

interface Props {
  planner: SearchQuery[];
  addToPlanner: (value: SearchQuery) => void;
  removeFromPlanner: (value: SearchQuery) => void;
}

export const MyPlanner: NextPage<Props> = (props: Props): React.ReactNode => {
  let results: GenericFetchedData<SearchQuery[]> = {
    state: 'loading',
  };
  if (props.planner.length) {
    results = {
      state: 'done',
      data: props.planner,
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
