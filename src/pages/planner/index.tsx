import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

import TopMenu from '@/components/navigation/topMenu/topMenu';
import MyPlannerEmpty from '@/components/planner/MyPlannerEmpty/myPlannerEmpty';
import MyPlannerError from '@/components/planner/MyPlannerError/myPlannerError';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/plannerCoursesTable';
import { type SearchQuery } from '@/modules/SearchQuery/SearchQuery';

type GenericFetchedDataError<T> = {
  state: 'error';
  data?: T;
};
type GenericFetchedDataLoading = {
  state: 'loading';
};
type GenericFetchedDataDone<T> = {
  state: 'done';
  data: T;
};
export type GenericFetchedData<T> =
  | GenericFetchedDataError<T>
  | GenericFetchedDataLoading
  | GenericFetchedDataDone<T>;

export const MyPlanner: NextPage<{ pageTitle: string }> = ({
  pageTitle,
}: {
  pageTitle: string;
}): React.ReactNode => {
  const router = useRouter();

  //List of course+prof combos, data on each still needs to be fetched
  const [results, setResults] = useState<GenericFetchedData<SearchQuery[]>>({
    state: 'loading',
  });

  const x = [{ prefix: 'hi' }];
  useEffect(() => {
    setResults({
      state: 'done',
      data: x as SearchQuery[],
    });
  }, [router.isReady, router.query.searchTerms]);

  const panelLRef = useRef<ImperativePanelHandle>(null);
  const panelRRef = useRef<ImperativePanelHandle>(null);
  // Resets RHS & LHS to 50/50 when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(50);
  };

  //Main content: loading, error, or normal
  let contentComponent;

  if (results.state === 'done' && !results.data) {
    contentComponent = <MyPlannerEmpty />;
  } else if (results.state === 'error') {
    contentComponent = <MyPlannerError />;
  } else {
    const plannerCoursesTable = <PlannerCoursesTable />;

    contentComponent = (
      <>
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
        <title>{'My Planner - ' + 'UTD TRENDS'}</title>
        <link
          rel="canonical"
          href="https://trends.utdnebula.com/planner"
          key="canonical"
        />
        <meta
          key="og:title"
          property="og:title"
          content={'Results - ' + pageTitle + 'UTD TRENDS'}
        />
        <meta
          property="og:url"
          content="https://trends.utdnebula.com/planner"
        />
      </Head>
      <div className="w-full bg-light h-full">
        <TopMenu
          resultsLoading={results.state}
          setResultsLoading={() => setResults({ state: 'loading' })}
          isPlanner={true}
        />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default MyPlanner;
