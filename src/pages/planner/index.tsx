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
import MyPlannerEmpty from '@/components/planner/MyPlannerEmpty/MyPlannerEmpty';
import PlannerCoursesTable from '@/components/planner/PlannerCoursesTable/PlannerCoursesTable';
import PlannerSchedule from '@/components/planner/PlannerSchedule/PlannerSchedule';
import type { GenericFetchedData } from '@/modules/GenericFetchedData/GenericFetchedData';
import type { GradesType } from '@/modules/GradesType/GradesType';
import {
  convertToProfOnly,
  type SearchQuery,
  searchQueryEqual,
  searchQueryLabel,
} from '@/modules/SearchQuery/SearchQuery';
import type { SectionsType } from '@/modules/SectionsType/SectionsType';
import type { RMPInterface } from '@/pages/api/ratemyprofessorScraper';
import type { SectionsData } from '@/pages/api/sections';

function removeDuplicates(array: SearchQuery[]) {
  return array.filter(
    (obj1, index, self) =>
      index === self.findIndex((obj2) => searchQueryEqual(obj1, obj2)),
  );
}

const sampleSectionData: SectionsData = [
  {
    _id: '672f168a3e61da2b1e596bf2',
    section_number: '0U1',
    course_reference: '672f16483e61da2b1e59243c',
    section_corequisites: null,
    academic_session: {
      name: '19U',
      start_date: '2019-05-23T05:00:00Z',
      end_date: '2019-08-07T05:00:00Z',
    },
    professors: ['672f167f3e61da2b1e5960c0'],
    teaching_assistants: [],
    internal_class_number: '52738',
    instruction_mode: 'Face-to-Face',
    meetings: [
      {
        start_date: '2019-05-23T05:00:00Z',
        end_date: '2019-08-05T05:00:00Z',
        meeting_days: ['Tuesday', 'Thursday'],
        start_time: '3:45pm',
        end_time: '5:15pm',
        modality: '',
        location: {
          building: 'JSOM',
          room: '12.202',
          map_uri: 'https://locator.utdallas.edu/JSOM_12.202',
        },
      },
    ],
    core_flags: ['070'],
    syllabus_uri: 'https://dox.utdallas.edu/syl82961',
    grade_distribution: [2, 7, 7, 5, 3, 9, 2, 4, 1, 1, 0, 0, 2, 0],
    attributes: null,
  },
];

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
    [key: string]: GenericFetchedData<SectionsType>;
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
  console.log(/*props.grades, props.rmp, */ props.sections);

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
  // Resets RHS & LHS to 40/60 when double clicking handle
  const handleResizeDoubleClick = () => {
    panelLRef.current?.resize(40);
  };

  //Main content: loading, error, or normal
  let contentComponent;

  if (results.state === 'done' && !results.data.length) {
    contentComponent = <MyPlannerEmpty />;
  } else {
    const plannerCoursesTable = (
      <PlannerCoursesTable
        courses={results.state === 'done' ? results.data : []}
        addToPlanner={props.addToPlanner}
        removeFromPlanner={props.removeFromPlanner}
        sections={props.sections}
        grades={props.grades}
        rmp={props.rmp}
      />
    );

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
          <Panel ref={panelLRef} minSize={30} defaultSize={40}>
            {plannerCoursesTable}
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
            <div className="sticky top-4 mt-4">
              <PlannerSchedule
                selectedSections={sampleSectionData as SectionsData}
              />
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
        <TopMenu isPlanner />
        <main className="p-4">{contentComponent}</main>
      </div>
    </>
  );
};

export default MyPlanner;
